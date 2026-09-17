const axios = require('axios');

// Shared client for the GI-KACE e-invoice API (https://api.einvoice.gikace.org/docs#/).
// Reuses the same INVOICE_API_KEY as the existing product sync (invoiceCourseSync.js),
// sent as x-api-key — the site also documents bearer/JWT auth, but the static API key
// already works for the existing sync so we keep the one auth path for every call here.
const BASE_URL = process.env.INVOICE_API_BASE_URL || 'https://api.einvoice.gikace.org';

function authHeaders() {
  return process.env.INVOICE_API_KEY ? { 'x-api-key': process.env.INVOICE_API_KEY } : undefined;
}

// GET /products/courses — all academic products across branches, each with its own
// branch-specific product id (the id /invoices/academic needs as course_id).
async function fetchAcademicCourses() {
  const { data } = await axios.get(`${BASE_URL}/products/courses`, {
    headers: authHeaders(),
    timeout: 15000,
  });

  if (!Array.isArray(data)) {
    throw new Error('Invoice courses API did not return an array — check INVOICE_API_BASE_URL and response shape.');
  }

  return data;
}

// POST /invoices/academic — creates the invoice and, per the invoice site, the
// student/contact record behind it. course_id must be a specific product id from
// fetchAcademicCourses(), not the course name.
async function createAcademicInvoice({ course_id, name, cellphone }) {
  const { data } = await axios.post(
    `${BASE_URL}/invoices/academic`,
    { course_id, name, cellphone },
    { headers: authHeaders(), timeout: 15000 }
  );

  return data;
}

module.exports = {
  fetchAcademicCourses,
  createAcademicInvoice,
  BASE_URL,
};
