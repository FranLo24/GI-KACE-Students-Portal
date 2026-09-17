const { PrismaClient } = require('@prisma/client');
const { fetchAcademicCourses, createAcademicInvoice } = require('../services/invoiceApiClient');
const { BRANCH_LOCATION_ALIASES } = require('../services/invoiceCourseSync');

const prisma = new PrismaClient();

function normalizeName(name = '') {
  return name.trim().replace(/\s+/g, ' ');
}

// Reverse of BRANCH_LOCATION_ALIASES: a portal location (e.g. "Sunyani") can be
// spelled as more than one branch_code on the invoice side (e.g. "SUN", "SUNYANI").
function branchCodesForLocation(location) {
  return Object.entries(BRANCH_LOCATION_ALIASES)
    .filter(([, mappedLocation]) => mappedLocation === location)
    .map(([code]) => code);
}

// GET /admin/invoice-courses — proxies GET /products/courses so the admin UI can
// show the live invoice catalogue (e.g. to explain why a match failed).
const getInvoiceCourses = async (req, res) => {
  try {
    const products = await fetchAcademicCourses();
    res.json(products);
  } catch (error) {
    console.error('Fetch invoice courses error:', error?.response?.data || error);
    res.status(502).json({ message: 'Failed to fetch courses from the invoice site.' });
  }
};

// POST /admin/students/:id/invoice — looks up the student's course + center location,
// matches it against the live invoice course catalogue to find that branch's specific
// product id, then creates the academic invoice for them. The invoice site creates the
// student/contact record itself from name + cellphone, so no separate principal call.
const createStudentInvoice = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const location = student.customFields?.['center-location'];
    const courseName = normalizeName(student.courseTitle);
    const branchCodes = location ? branchCodesForLocation(location) : [];

    const products = await fetchAcademicCourses();

    const match = products.find((product) => {
      if (!product.is_active) return false;
      if (product.product_type?.type !== 'academic') return false;
      if (normalizeName(product.name || '') !== courseName) return false;
      if (branchCodes.length === 0) return true;
      return branchCodes.includes((product.branch?.branch_code || '').toUpperCase());
    });

    if (!match) {
      return res.status(404).json({
        message:
          `No matching invoice course found for "${student.courseTitle}"` +
          (location ? ` at ${location}` : '') +
          '. Check the invoice site\'s course catalogue and this portal\'s course/location naming.',
      });
    }

    const invoice = await createAcademicInvoice({
      course_id: match.id,
      name: student.fullName,
      cellphone: student.phoneNumber,
    });

    res.status(201).json({
      message: 'Invoice created',
      invoice,
      matchedProduct: { id: match.id, name: match.name, price: match.price },
    });
  } catch (error) {
    console.error('Create student invoice error:', error?.response?.data || error);
    res.status(502).json({
      message: error?.response?.data?.message || 'Failed to create the invoice on the invoice site.',
    });
  }
};

module.exports = {
  getInvoiceCourses,
  createStudentInvoice,
};
