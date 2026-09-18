const { fetchAcademicCourses } = require('../services/invoiceApiClient');

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

module.exports = {
  getInvoiceCourses,
};
