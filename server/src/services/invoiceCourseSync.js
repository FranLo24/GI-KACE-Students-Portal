const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Maps an invoice branch_code to the "Center Location" option strings this
// portal already uses (Admin > Settings > form builder > center-location
// field). Add an entry here whenever the invoice site adds a new branch —
// unmapped branches are skipped (and logged) rather than guessed at.
const BRANCH_LOCATION_MAP = {
  ACCRA: 'Accra',
  BOLGA: 'Bolgatanga',
  SUNYANI: 'Sunyani',
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
    const location = branchCode ? BRANCH_LOCATION_MAP[branchCode] : undefined;
    if (!location) {
      console.warn(`[invoiceCourseSync] Unmapped branch "${branchCode}" for product "${name}" — add it to BRANCH_LOCATION_MAP to sync its price.`);
      continue;
    }

    if (!groups.has(name)) groups.set(name, new Map());
    groups.get(name).set(location, Number(product.price));
  }

  return groups;
}

// Pulls the product list from the invoice API and upserts it into the local
// Course/CourseFee tables. Only touches courses/fees it created on a
// previous run (tracked via Course.syncKey) — anything an admin created by
// hand in the Course Management panel is left alone.
async function syncCoursesFromInvoice() {
  const url = process.env.INVOICE_PRODUCTS_API_URL;
  if (!url) {
    return { skipped: true, reason: 'INVOICE_PRODUCTS_API_URL is not configured' };
  }

  const headers = process.env.INVOICE_API_KEY ? { Authorization: `Bearer ${process.env.INVOICE_API_KEY}` } : undefined;
  const { data: products } = await axios.get(url, { headers });

  // Refuse to proceed on an unexpected shape rather than silently treating
  // it as an empty product list — that would soft-disable every previously
  // synced course on the very next run.
  if (!Array.isArray(products)) {
    throw new Error('Invoice products API did not return an array — check INVOICE_PRODUCTS_API_URL and response shape.');
  }

  const groups = groupAcademicProducts(products);
  if (groups.size === 0) {
    throw new Error('Invoice products API returned no active academic products — aborting sync to avoid disabling every course.');
  }
  const knownLocations = new Set(Object.values(BRANCH_LOCATION_MAP));

  let created = 0;
  let updated = 0;
  let disabled = 0;

  const seenKeys = new Set();

  for (const [name, feesByLocation] of groups) {
    seenKeys.add(name);

    let course = await prisma.course.findUnique({ where: { syncKey: name }, include: { locationFees: true } });

    if (!course) {
      const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
      course = await prisma.course.create({
        data: {
          title: name,
          category: name,
          syncKey: name,
          enabled: true,
          order: (maxOrder._max.order ?? -1) + 1,
        },
        include: { locationFees: true },
      });
      created += 1;
    } else {
      updated += 1;
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

  return { skipped: false, created, updated, disabled, totalCourses: groups.size };
}

module.exports = { syncCoursesFromInvoice, groupAcademicProducts, BRANCH_LOCATION_MAP };
