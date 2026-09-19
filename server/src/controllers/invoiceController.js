const { PrismaClient } = require('@prisma/client');
const { fetchAcademicCourses, fetchInvoiceStatuses } = require('../services/invoiceApiClient');
const { parseIds } = require('../utils/parseIds');

const prisma = new PrismaClient();

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

// A student's status follows their invoice: a paid invoice means they're done,
// recorded as "completed", while any other invoice state still means they've been
// invoiced, which is what "admitted" (shortlisted) records. Students linked to an
// invoice they got directly from the invoice site are placed on this ladder the
// moment their reference is linked, rather than being left pending.
function admissionStatusForPayment(paymentStatus) {
  return paymentStatus === 'paid' ? 'completed' : 'admitted';
}

// POST /invoices/status only matches the exact, case-sensitive reference. References
// are issued in upper case ("GIK-ACA-…"), so a lower-cased paste is also tried in
// upper case.
function referenceCandidates(input) {
  const trimmed = typeof input === 'string' ? input.trim() : '';
  return [...new Set([trimmed, trimmed.toUpperCase()])].filter(Boolean);
}

// GET /admin/invoice-lookup?reference= — looks a payment reference up on the invoice
// site, for invoices the portal has no student linked to (e.g. created directly on
// the invoice site). Also says which student, if any, it's already linked to here.
const lookupInvoiceReference = async (req, res) => {
  const candidates = referenceCandidates(req.query.reference);
  if (candidates.length === 0) return res.status(400).json({ message: 'reference is required' });

  let invoice;
  try {
    [invoice] = await fetchInvoiceStatuses(candidates);
  } catch (error) {
    console.error('Invoice reference lookup error:', error?.response?.data || error);
    return res.status(502).json({ message: 'Failed to look up the payment reference on the invoice site.' });
  }

  if (!invoice) return res.json({ found: false });

  try {
    const linkedStudent = await prisma.student.findFirst({
      where: { paymentReference: invoice.reference },
      select: { id: true, fullName: true },
    });

    res.json({ found: true, reference: invoice.reference, name: invoice.name, status: invoice.status, linkedStudent });
  } catch (error) {
    console.error('Invoice reference lookup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /admin/students/:id/payment-reference — links an invoice that exists on the
// invoice site to a student who has no payment reference yet. The reference is
// checked with the invoice site first, and a reference can only be linked to one
// student.
const linkPaymentReference = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  const candidates = referenceCandidates(req.body.reference);
  if (candidates.length === 0) return res.status(400).json({ message: 'reference is required' });

  try {
    const student = await prisma.student.findUnique({ where: { id }, select: { paymentReference: true } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.paymentReference) {
      return res.status(409).json({ message: `This student is already linked to payment reference ${student.paymentReference}.` });
    }

    let invoice;
    try {
      [invoice] = await fetchInvoiceStatuses(candidates);
    } catch (error) {
      console.error('Link payment reference error:', error?.response?.data || error);
      return res.status(502).json({ message: 'Failed to check the payment reference on the invoice site.' });
    }

    if (!invoice) {
      return res.status(404).json({ message: 'No invoice with this payment reference was found on the invoice site.' });
    }

    const alreadyLinked = await prisma.student.findFirst({
      where: { paymentReference: invoice.reference },
      select: { id: true },
    });
    if (alreadyLinked) {
      return res.status(409).json({ message: 'This payment reference is already linked to another student.' });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        paymentReference: invoice.reference,
        paymentStatus: invoice.status,
        admissionStatus: admissionStatusForPayment(invoice.status),
      },
    });

    res.json({ message: 'Payment reference linked', student: updated });
  } catch (error) {
    console.error('Link payment reference error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /admin/students/verify-payment — asks the invoice site for the current
// status of each selected student's payment reference and saves it on the
// student. Students without a reference (not shortlisted yet) are skipped. A
// reference the invoice site doesn't return comes back with status null, and the
// student's last saved status is left as it was.
const verifyPaymentStatuses = async (req, res) => {
  const ids = parseIds(req.body.ids);
  if (!ids) return res.status(400).json({ message: 'ids must be a non-empty array of student IDs' });

  try {
    const students = await prisma.student.findMany({
      where: { id: { in: ids }, paymentReference: { not: null } },
      select: { id: true, paymentReference: true },
    });

    if (students.length === 0) {
      return res.status(400).json({ message: 'None of the selected students have a payment reference to verify yet.' });
    }

    let statuses;
    try {
      statuses = await fetchInvoiceStatuses(students.map((student) => student.paymentReference));
    } catch (error) {
      console.error('Verify payment status error:', error?.response?.data || error);
      return res.status(502).json({ message: 'Failed to fetch payment statuses from the invoice site.' });
    }

    const statusByReference = new Map(statuses.map((entry) => [entry.reference, entry.status]));
    const results = [];

    for (const student of students) {
      const status = statusByReference.get(student.paymentReference) ?? null;
      let admissionStatus = null;

      if (status) {
        admissionStatus = admissionStatusForPayment(status);
        await prisma.student.update({
          where: { id: student.id },
          data: { paymentStatus: status, admissionStatus },
        });
      }

      results.push({ id: student.id, paymentReference: student.paymentReference, status, admissionStatus });
    }

    res.json({ results, skipped: ids.length - students.length });
  } catch (error) {
    console.error('Verify payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getInvoiceCourses,
  lookupInvoiceReference,
  linkPaymentReference,
  verifyPaymentStatuses,
};
