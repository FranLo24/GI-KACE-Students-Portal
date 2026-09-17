const { PrismaClient } = require('@prisma/client');
const {
  fetchAcademicCourses,
  fetchPrincipals,
  createStudentPrincipal,
  createAcademicInvoice,
} = require('../services/invoiceApiClient');

const prisma = new PrismaClient();

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

// /invoices/academic bills an existing contact — it rejects any email the invoice
// site doesn't already know as a principal — so a student invoiced for the first
// time needs their contact created before the invoice call.
async function ensurePrincipal({ email, name, cellphone }) {
  const principals = await fetchPrincipals();
  const existing = principals.find((principal) => normalizeEmail(principal.email || '') === email);

  return existing || createStudentPrincipal({ email, name, cellphone });
}

// Picks the fee row that carries the invoice product id for this student. A
// course has one fee per center location, and each of those is a separate
// product on the invoice site with its own price.
function resolveCourseFee(course, location) {
  const fees = course.locationFees;

  if (location) {
    return { fee: fees.find((entry) => entry.location === location) };
  }

  // No center location recorded: only unambiguous when the course is offered at
  // a single location, otherwise we'd be guessing which branch's price to bill.
  if (fees.length === 1) return { fee: fees[0] };

  return {
    error:
      fees.length === 0
        ? 'This course has no location fees set up. Run "Sync from Invoice" in Course Management.'
        : 'This student has no center location recorded, and the course is offered at more than one location.',
  };
}

// GET /admin/invoice-courses — proxies the live invoice catalogue so the admin UI
// can show it (e.g. to explain why a course isn't linked yet).
const getInvoiceCourses = async (req, res) => {
  try {
    const products = await fetchAcademicCourses();
    res.json(products);
  } catch (error) {
    console.error('Fetch invoice courses error:', error?.response?.data || error);
    res.status(502).json({ message: 'Failed to fetch courses from the invoice site.' });
  }
};

// POST /admin/students/:id/invoice — resolves the student's course + center
// location to the invoice product id stored on that course's fee, makes sure the
// student exists as a principal on the invoice site, then creates the invoice.
// No name matching: the id recorded by the sync is the link between the two systems.
const createStudentInvoice = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { course: { include: { locationFees: true } } },
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.course) {
      return res.status(409).json({
        message:
          `"${student.courseTitle}" isn't linked to a course in this portal, so there's no invoice product to bill. ` +
          'Run "Sync from Invoice" in Course Management, then re-save the student\'s course.',
      });
    }

    const location = student.customFields?.['center-location'];
    const { fee, error } = resolveCourseFee(student.course, location);

    if (error) return res.status(409).json({ message: error });

    if (!fee) {
      return res.status(409).json({
        message: `"${student.course.title}" has no fee set up for ${location}, so it has no invoice product there.`,
      });
    }

    if (!fee.invoiceProductId) {
      return res.status(409).json({
        message:
          `"${student.course.title}" at ${fee.location} isn't linked to a product on the invoice site. ` +
          'Run "Sync from Invoice" in Course Management to link it.',
      });
    }

    const email = normalizeEmail(student.emailAddress);
    await ensurePrincipal({ email, name: student.fullName, cellphone: student.phoneNumber });

    const invoice = await createAcademicInvoice({
      course_id: fee.invoiceProductId,
      email,
      name: student.fullName,
      cellphone: student.phoneNumber,
    });

    res.status(201).json({
      message: 'Invoice created',
      invoice,
      matchedProduct: { id: fee.invoiceProductId, name: student.course.title, price: fee.fee },
    });
  } catch (error) {
    console.error('Create student invoice error:', error?.response?.data || error);
    const message = error?.response?.data?.message;
    res.status(502).json({
      message: (Array.isArray(message) ? message.join(' ') : message) || 'Failed to create the invoice on the invoice site.',
    });
  }
};

module.exports = {
  getInvoiceCourses,
  createStudentInvoice,
};
