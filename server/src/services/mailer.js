const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendAdmissionEmail(student) {
  await sendMail({
    to: student.emailAddress,
    subject: 'You have been admitted — GI-KACE',
    html: `
      <p>Congratulations ${student.fullName},</p>
      <p>You have been admitted into <strong>${student.courseTitle}</strong> at GI-KACE.</p>
      <p>We look forward to having you in class. Further details will follow separately.</p>
    `,
    text: `Congratulations ${student.fullName}, you have been admitted into ${student.courseTitle} at GI-KACE.`,
  });
}

module.exports = { sendMail, sendAdmissionEmail };
