const { PrismaClient } = require('@prisma/client');
const { createInvoiceForStudent, invoiceErrorResponse } = require('../services/studentInvoice');
const { parseIds } = require('../utils/parseIds');

const prisma = new PrismaClient();

const WITH_COURSE_FEES = { course: { include: { locationFees: true } } };

// Shortlisting a student bills them: it creates their academic invoice on the
// e-invoice site and, only once that succeeds, marks them shortlisted (stored as
// admissionStatus "admitted") and records the invoice's payment reference. No SMS
// or email is sent. Because an already shortlisted student is skipped, nobody gets
// invoiced twice.
//
// Resolves to { ok: true, invoice, paymentReference, matchedProduct } or
// { ok: false, status, message }.
async function shortlistAndInvoice(student) {
  let result;
  try {
    result = await createInvoiceForStudent(student);
  } catch (error) {
    return { ok: false, ...invoiceErrorResponse(error) };
  }

  try {
    await prisma.student.update({
      where: { id: student.id },
      data: { admissionStatus: 'admitted', admittedAt: new Date(), paymentReference: result.paymentReference },
    });
  } catch (error) {
    console.error('Shortlist status save error (invoice already created):', error);
    return {
      ok: false,
      status: 500,
      message:
        'The invoice was created, but saving the shortlist status failed. ' +
        'Check the invoice site before trying again so the student isn\'t invoiced twice.',
    };
  }

  return { ok: true, ...result };
}

const admitStudent = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const student = await prisma.student.findUnique({ where: { id }, include: WITH_COURSE_FEES });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.admissionStatus === 'admitted') {
      return res.status(409).json({ message: 'This student is already shortlisted.' });
    }

    const outcome = await shortlistAndInvoice(student);
    if (!outcome.ok) return res.status(outcome.status).json({ message: outcome.message });

    res.json({
      message: 'Student shortlisted',
      invoice: outcome.invoice,
      paymentReference: outcome.paymentReference,
      matchedProduct: outcome.matchedProduct,
    });
  } catch (error) {
    console.error('Shortlist student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Students are invoiced one at a time, and one failure doesn't stop the rest —
// each gets its own result so the admin can see who was shortlisted and why the
// others weren't.
const bulkAdmitStudents = async (req, res) => {
  const ids = parseIds(req.body.ids);
  if (!ids) return res.status(400).json({ message: 'ids must be a non-empty array of student IDs' });

  try {
    const students = await prisma.student.findMany({ where: { id: { in: ids } }, include: WITH_COURSE_FEES });
    const results = [];

    for (const student of students) {
      if (student.admissionStatus === 'admitted') {
        results.push({ id: student.id, status: 'already_shortlisted' });
        continue;
      }

      const outcome = await shortlistAndInvoice(student);
      results.push(
        outcome.ok
          ? {
              id: student.id,
              status: 'shortlisted',
              paymentReference: outcome.paymentReference,
              matchedProduct: outcome.matchedProduct,
            }
          : { id: student.id, status: 'failed', message: outcome.message }
      );
    }

    const count = (status) => results.filter((result) => result.status === status).length;

    res.json({
      message: 'Bulk shortlist complete',
      shortlisted: count('shortlisted'),
      alreadyShortlisted: count('already_shortlisted'),
      failed: count('failed'),
      results,
    });
  } catch (error) {
    console.error('Bulk shortlist students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { admitStudent, bulkAdmitStudents };
