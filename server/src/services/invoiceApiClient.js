const axios = require('axios');

// Shared client for the GI-KACE e-invoice API (https://api.einvoice.gikace.org/docs#/).
// Reuses the same INVOICE_API_KEY as the existing product sync (invoiceCourseSync.js),
// sent as x-api-key — the site also documents bearer/JWT auth, but the static API key
// already works for the existing sync so we keep the one auth path for every call here.
const BASE_URL = process.env.INVOICE_API_BASE_URL || 'https://api.einvoice.gikace.org';

function authHeaders() {
  return process.env.INVOICE_API_KEY ? { 'x-api-key': process.env.INVOICE_API_KEY } : undefined;
}

const PAGE_SIZE = 100;

// The list endpoints here are offset-paginated and return a bare array, so keep
// requesting pages until a short (or empty) one comes back.
async function fetchAllPages(path) {
  const headers = authHeaders();
  const all = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(`${BASE_URL}${path}`, {
      params: { page, limit: PAGE_SIZE },
      headers,
      timeout: 15000,
    });

    if (!Array.isArray(data)) {
      throw new Error(`Invoice API ${path} did not return an array — check INVOICE_API_BASE_URL and response shape.`);
    }

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
}

// Active academic courses, each with its own branch-specific product id (the id
// /invoices/academic needs as course_id).
//
// GET /products/courses is the documented endpoint and is already scoped to
// courses, so it carries no product_type field — never filter its results on
// product_type, everything it returns is a course. It has also been observed
// serving an empty list while the same courses were still available under the
// generic paginated GET /products, so fall back to that (filtered to academic)
// rather than reporting an empty catalogue.
async function fetchAcademicCourses() {
  const { data } = await axios.get(`${BASE_URL}/products/courses`, {
    headers: authHeaders(),
    timeout: 15000,
  });

  if (!Array.isArray(data)) {
    throw new Error('Invoice courses API did not return an array — check INVOICE_API_BASE_URL and response shape.');
  }

  const courses = data.filter((course) => course.is_active);
  if (courses.length > 0) return courses;

  const products = await fetchAllPages('/products');
  return products.filter((product) => product.is_active && product.product_type?.type === 'academic');
}

// GET /principals — the invoice site's contact list. It has no email filter, so
// callers page through the whole list and match on email themselves.
async function fetchPrincipals() {
  return fetchAllPages('/principals');
}

// POST /principals/student — creates the student contact an invoice gets billed to.
async function createStudentPrincipal({ email, name, cellphone }) {
  const { data } = await axios.post(
    `${BASE_URL}/principals/student`,
    { type: 'individual', email, name, cellphone },
    { headers: authHeaders(), timeout: 15000 }
  );

  return data;
}

// POST /invoices/academic — creates the invoice. Despite what the docs suggest, it
// does NOT create the contact behind it: the email has to already exist as a
// principal or the call fails with "email with email <x> doesn't exist". course_id
// must be a specific product id from fetchAcademicCourses(), not the course name.
async function createAcademicInvoice({ course_id, email, name, cellphone }) {
  const { data } = await axios.post(
    `${BASE_URL}/invoices/academic`,
    { course_id, email, name, cellphone },
    { headers: authHeaders(), timeout: 15000 }
  );

  return data;
}

module.exports = {
  fetchAcademicCourses,
  fetchPrincipals,
  createStudentPrincipal,
  createAcademicInvoice,
  BASE_URL,
};
