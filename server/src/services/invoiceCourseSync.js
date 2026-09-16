const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PAGE_SIZE = 100;

// Maps an invoice branch_code to the "Center Location" option strings this
// portal already uses (Admin > Settings > form builder > center-location
// field). Multiple aliases per location because the invoice API has used
// different code formats across environments (e.g. "SUNYANI" vs "SUN") —
// add an entry here whenever the invoice site adds a new branch or code;
// unmapped branches are skipped (and logged) rather than guessed at.
const BRANCH_LOCATION_ALIASES = {
  ACCRA: 'Accra',
  BOLGA: 'Bolgatanga',
  BOLGATANGA: 'Bolgatanga',
  SUN: 'Sunyani',
  SUNYANI: 'Sunyani',
};

// Maps an invoice product name to the exact title of an existing,
// hand-created course it should be treated as — for cases where the
// invoice site's name doesn't match the portal's course title verbatim
// (e.g. an abbreviation). Without an entry here, a mismatched name creates
// a separate course card instead of updating the one you'd expect. Add an
// entry whenever that happens.
const COURSE_NAME_ALIASES = {
  DBC: 'Diploma in Business Computing',
};

function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

// Groups the raw invoice product list into one entry per distinct course
// name, collecting each branch's price under that name. Non-academic
// products (rentals like "Projector", "Auditorium") and inactive products
// are dropped.
function groupAcademicProducts(products) {
  const groups = new Map();

  for (const product of products) {
    if (!product.is_active) continue;
    if (product.product_type?.type !== 'academic') continue;

    const name = normalizeName(product.name || '');
    if (!name) continue;

    const branchCode = product.branch?.branch_code;
    const location = branchCode ? BRANCH_LOCATION_ALIASES[branchCode.toUpperCase()] : undefined;
    if (!location) {
      console.warn(`[invoiceCourseSync] Unmapped branch "${branchCode}" for product "${name}" — add it to BRANCH_LOCATION_ALIASES to sync its price.`);
      continue;
    }

    if (!groups.has(name)) groups.set(name, new Map());
    groups.get(name).set(location, Number(product.price));
  }

  return groups;
}

async function fetchAllProducts(url, headers) {
  const all = [];
  let page = 1;

  // Offset-based pagination — keep requesting pages until a short (or
  // empty) page comes back, matching the API's page/limit contract.
  while (true) {
    const { data } = await axios.get(url, { params: { page, limit: PAGE_SIZE }, headers, timeout: 15000 });
    if (!Array.isArray(data)) {
      throw new Error('Invoice products API did not return an array — check INVOICE_PRODUCTS_API_URL and response shape.');
    }
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
}

// Pulls the product list from the invoice API and upserts it into the local
// Course/CourseFee tables. A course is matched, in order:
//   1. by Course.syncKey (a course this sync created/adopted on a prior run)
//   2. by an exact title match against a course an admin created by hand
//      (syncKey still null) — this "adopts" it instead of creating a
//      duplicate entry, since the admin catalogue and invoice catalogue
//      often list the same course under the same name
//   3. otherwise a new course is created
// Anything the sync doesn't recognize (custom descriptions, images, courses
// with no invoice counterpart) is left untouched.
async function syncCoursesFromInvoice() {
  const url = process.env.INVOICE_PRODUCTS_API_URL;
  if (!url) {
    return { skipped: true, reason: 'INVOICE_PRODUCTS_API_URL is not configured' };
  }

  const headers = process.env.INVOICE_API_KEY ? { 'x-api-key': process.env.INVOICE_API_KEY } : undefined;
  const products = await fetchAllProducts(url, headers);

  const groups = groupAcademicProducts(products);
  if (groups.size === 0) {
    throw new Error('Invoice products API returned no active academic products — aborting sync to avoid disabling every course.');
  }
  const knownLocations = new Set(Object.values(BRANCH_LOCATION_ALIASES));

  let created = 0;
  let adopted = 0;
  let updated = 0;
  let disabled = 0;

  const seenKeys = new Set();

  for (const [name, feesByLocation] of groups) {
    seenKeys.add(name);

    let course = await prisma.course.findUnique({ where: { syncKey: name }, include: { locationFees: true } });

    if (course) {
      updated += 1;
    } else {
      // Look for a hand-created course with the same (or aliased) title
      // before making a new one, so re-running the sync after an admin has
      // already built out the catalogue doesn't produce duplicate cards.
      const canonicalTitle = COURSE_NAME_ALIASES[name] || name;
      const existing = await prisma.course.findFirst({ where: { syncKey: null, title: canonicalTitle }, include: { locationFees: true } });

      if (existing) {
        course = await prisma.course.update({ where: { id: existing.id }, data: { syncKey: name }, include: { locationFees: true } });
        adopted += 1;
      } else {
        const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
        course = await prisma.course.create({
          data: {
            title: canonicalTitle,
            category: canonicalTitle,
            syncKey: name,
            enabled: true,
            order: (maxOrder._max.order ?? -1) + 1,
          },
          include: { locationFees: true },
        });
        created += 1;
      }
    }

    await prisma.$transaction(
      Array.from(feesByLocation.entries()).map(([location, fee]) =>
        prisma.courseFee.upsert({
          where: { courseId_location: { courseId: course.id, location } },
          update: { fee },
          create: { courseId: course.id, location, fee },
        })
      )
    );

    // Drop fees for locations this course used to have via the invoice but
    // no longer does — scoped to locations the sync is authoritative over,
    // so a manually-added fee for an unmapped location is never touched.
    const staleLocations = course.locationFees
      .map((entry) => entry.location)
      .filter((location) => knownLocations.has(location) && !feesByLocation.has(location));

    if (staleLocations.length > 0) {
      await prisma.courseFee.deleteMany({ where: { courseId: course.id, location: { in: staleLocations } } });
    }
  }

  // Soft-disable sync-managed courses that no longer appear in the source at
  // all (rather than deleting them — students already registered for a
  // course keep their existing record either way, since Student stores the
  // course title/category as plain strings, not a foreign key).
  const disappeared = await prisma.course.findMany({
    where: { syncKey: { not: null, notIn: Array.from(seenKeys) }, enabled: true },
  });

  if (disappeared.length > 0) {
    await prisma.course.updateMany({
      where: { id: { in: disappeared.map((course) => course.id) } },
      data: { enabled: false },
    });
    disabled = disappeared.length;
  }

  return { skipped: false, created, adopted, updated, disabled, totalCourses: groups.size };
}

module.exports = {
  syncCoursesFromInvoice,
  groupAcademicProducts,
  fetchAllProducts,
  BRANCH_LOCATION_ALIASES,
  COURSE_NAME_ALIASES,
};
