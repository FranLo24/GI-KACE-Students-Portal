const { PrismaClient } = require('@prisma/client');
const { fetchAcademicCourses } = require('./invoiceApiClient');

const prisma = new PrismaClient();

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
// (e.g. an abbreviation). This only matters the *first* time a product is
// seen: once its id is stored on the CourseFee, every later sync matches on
// that id and the names are free to diverge.
const COURSE_NAME_ALIASES = {
  DBC: 'Diploma in Business Computing',
};

function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

// Finds the course a newly-seen invoice product belongs to, in order:
//   1. by Course.syncKey (a course this sync created/adopted on a prior run)
//   2. by an exact title match against a course an admin created by hand
//      (syncKey still null) — this "adopts" it instead of creating a
//      duplicate entry, since the admin catalogue and invoice catalogue
//      often list the same course under the same name
//   3. otherwise a new course is created
async function findOrCreateCourse(name) {
  const bySyncKey = await prisma.course.findUnique({ where: { syncKey: name } });
  if (bySyncKey) return { course: bySyncKey, outcome: 'updated' };

  const canonicalTitle = COURSE_NAME_ALIASES[name] || name;

  const handMade = await prisma.course.findFirst({ where: { syncKey: null, title: canonicalTitle } });
  if (handMade) {
    const course = await prisma.course.update({ where: { id: handMade.id }, data: { syncKey: name } });
    return { course, outcome: 'adopted' };
  }

  const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
  const course = await prisma.course.create({
    data: {
      title: canonicalTitle,
      category: canonicalTitle,
      syncKey: name,
      enabled: true,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return { course, outcome: 'created' };
}

// Pulls the invoice site's course catalogue and mirrors it into Course /
// CourseFee. Each invoice product is one (name, branch) pair, so it maps to
// exactly one CourseFee row, and that row stores the product's id — which is
// what POST /invoices/academic needs as course_id.
//
// Matching is id-first: a fee that already carries an invoiceProductId keeps
// its course even if the invoice site renames the product, so renames update a
// price instead of spawning a duplicate course. Names are only consulted for a
// product this portal has never seen before.
//
// Anything the sync doesn't recognize (custom descriptions, images, courses
// with no invoice counterpart) is left untouched.
async function syncCoursesFromInvoice() {
  if (!process.env.INVOICE_API_KEY) {
    return { skipped: true, reason: 'INVOICE_API_KEY is not configured' };
  }

  const products = await fetchAcademicCourses();

  if (products.length === 0) {
    throw new Error('Invoice API returned no active academic courses — aborting sync to avoid clearing every course fee.');
  }

  let created = 0;
  let adopted = 0;
  let updated = 0;
  let disabled = 0;
  let unmapped = 0;

  const seenProductIds = new Set();
  const seenCourseIds = new Set();

  for (const product of products) {
    const name = normalizeName(product.name || '');
    if (!name) continue;

    const branchCode = (product.branch?.branch_code || '').toUpperCase();
    const location = BRANCH_LOCATION_ALIASES[branchCode];
    if (!location) {
      console.warn(`[invoiceCourseSync] Unmapped branch "${branchCode}" for product "${name}" — add it to BRANCH_LOCATION_ALIASES to sync its price.`);
      unmapped += 1;
      continue;
    }

    const existingFee = await prisma.courseFee.findUnique({
      where: { invoiceProductId: product.id },
      include: { course: true },
    });

    let course = existingFee?.course;

    if (!course) {
      const result = await findOrCreateCourse(name);
      course = result.course;
      if (result.outcome === 'created') created += 1;
      else if (result.outcome === 'adopted') adopted += 1;
      else updated += 1;
    } else {
      updated += 1;

      // The product moved to a different branch on the invoice site — release
      // the id from the row it used to sit on, or the unique constraint on
      // invoiceProductId blocks writing it to the new location's row.
      if (existingFee.location !== location) {
        await prisma.courseFee.update({
          where: { id: existingFee.id },
          data: { invoiceProductId: null, invoiceBranchCode: null },
        });
      }
    }

    const fee = Number(product.price);

    await prisma.courseFee.upsert({
      where: { courseId_location: { courseId: course.id, location } },
      update: { fee, invoiceProductId: product.id, invoiceBranchCode: branchCode },
      create: { courseId: course.id, location, fee, invoiceProductId: product.id, invoiceBranchCode: branchCode },
    });

    seenProductIds.add(product.id);
    seenCourseIds.add(course.id);
  }

  // Fees whose product no longer exists on the invoice site can't be invoiced,
  // so drop them. Fees an admin entered by hand (no invoiceProductId) are left
  // alone — the sync is only authoritative over rows it created.
  const removedFees = await prisma.courseFee.deleteMany({
    where: {
      invoiceProductId: { not: null, notIn: Array.from(seenProductIds) },
    },
  });

  // Soft-disable sync-owned courses that no longer appear in the source at all
  // (rather than deleting them — a student's registration keeps its courseTitle
  // either way, and Student.courseId is set null rather than cascading).
  const disappeared = await prisma.course.findMany({
    where: {
      syncKey: { not: null },
      id: { notIn: Array.from(seenCourseIds) },
      enabled: true,
    },
    select: { id: true },
  });

  if (disappeared.length > 0) {
    await prisma.course.updateMany({
      where: { id: { in: disappeared.map((course) => course.id) } },
      data: { enabled: false },
    });
    disabled = disappeared.length;
  }

  return {
    skipped: false,
    created,
    adopted,
    updated,
    disabled,
    unmapped,
    removedFees: removedFees.count,
    totalProducts: seenProductIds.size,
    totalCourses: seenCourseIds.size,
  };
}

module.exports = {
  syncCoursesFromInvoice,
  BRANCH_LOCATION_ALIASES,
  COURSE_NAME_ALIASES,
};
