const {
  fetchPrincipals,
  createStudentPrincipal,
  createAcademicInvoice,
} = require('./invoiceApiClient');

// A problem with the portal's own course setup (course not linked, no fee for the
// student's location, fee not linked to an invoice product). Retrying won't help —
// an admin has to fix the setup first — so it's reported as a 409, not a 502.
class InvoiceSetupError extends Error {}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

// axios keeps a JSON request body as the string it sent; parse it back so it logs
// as readable JSON. GETs have no body, which comes back as undefined.
function parseBody(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
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

// Resolves the student's course + center location to the invoice product id
// stored on that course's fee, makes sure the student exists as a principal on the
// invoice site, then creates the academic invoice. No name matching: the id
// recorded by the sync is the link between the two systems.
//
// `student` must be loaded with course.locationFees. Throws InvoiceSetupError for
// setup problems, or whatever the invoice API call threw.
async function createInvoiceForStudent(student) {
  if (!student.course) {
    throw new InvoiceSetupError(
      `"${student.courseTitle}" isn't linked to a course in this portal, so there's no invoice product to bill. ` +
        'Run "Sync from Invoice" in Course Management, then re-save the student\'s course.'
    );
  }

  const location = student.customFields?.['center-location'];
  const { fee, error } = resolveCourseFee(student.course, location);

  if (error) throw new InvoiceSetupError(error);

  if (!fee) {
    throw new InvoiceSetupError(
      `"${student.course.title}" has no fee set up for ${location}, so it has no invoice product there.`
    );
  }

  if (!fee.invoiceProductId) {
    throw new InvoiceSetupError(
      `"${student.course.title}" at ${fee.location} isn't linked to a product on the invoice site. ` +
        'Run "Sync from Invoice" in Course Management to link it.'
    );
  }

  const email = normalizeEmail(student.emailAddress);
  await ensurePrincipal({ email, name: student.fullName, cellphone: student.phoneNumber });

  const invoice = await createAcademicInvoice({
    course_id: fee.invoiceProductId,
    email,
    name: student.fullName,
    cellphone: student.phoneNumber,
  });

  return {
    invoice,
    matchedProduct: { id: fee.invoiceProductId, name: student.course.title, price: fee.fee },
  };
}

// Turns a createInvoiceForStudent failure into the { status, message } to send back.
// Invoice API failures are logged with what was sent as well as the reply, so a
// failed call can be handed to the invoice team as-is. Headers are left out: they
// carry the API key.
function invoiceErrorResponse(error) {
  if (error instanceof InvoiceSetupError) return { status: 409, message: error.message };

  const request = error?.config;
  if (request) {
    console.error('Create student invoice error:', JSON.stringify({
      at: new Date().toISOString(),
      request: { method: request.method?.toUpperCase(), url: request.url, body: parseBody(request.data) },
      response: error.response ? { status: error.response.status, body: error.response.data } : { error: error.message },
    }, null, 2));
  } else {
    console.error('Create student invoice error:', error);
  }

  const message = error?.response?.data?.message;
  return {
    status: 502,
    message: (Array.isArray(message) ? message.join(' ') : message) || 'Failed to create the invoice on the invoice site.',
  };
}

module.exports = {
  createInvoiceForStudent,
  invoiceErrorResponse,
};
