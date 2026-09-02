const { PrismaClient } = require('@prisma/client');
const { sendSms } = require('../services/arkeselClient');
const { sendAdmissionEmail } = require('../services/mailer');

const prisma = new PrismaClient();

const admitStudent = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.admissionStatus === 'admitted') {
      return res.json({
        message: 'Student already admitted',
        smsStatus: student.admissionSmsStatus,
        emailStatus: student.admissionEmailStatus,
      });
    }

    let smsStatus = 'failed';
    let emailStatus = 'failed';

    try {
      await sendSms({
        to: student.phoneNumber,
        message: `Congratulations ${student.fullName}, you have been admitted into ${student.courseTitle} at GI-KACE.`,
      });
      smsStatus = 'sent';
    } catch (error) {
      console.error('Admission SMS error:', error?.response?.data || error);
    }

    try {
      await sendAdmissionEmail(student);
      emailStatus = 'sent';
    } catch (error) {
      console.error('Admission email error:', error);
    }

    await prisma.student.update({
      where: { id },
      data: {
        admissionStatus: 'admitted',
        admittedAt: new Date(),
        admissionSmsStatus: smsStatus,
        admissionEmailStatus: emailStatus,
      },
    });

    res.json({ message: 'Student admitted', smsStatus, emailStatus });
  } catch (error) {
    console.error('Admit student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { admitStudent };
