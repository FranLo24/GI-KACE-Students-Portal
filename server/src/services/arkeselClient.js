const axios = require('axios');

function toArkeselFormat(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0')) return `233${digits.slice(1)}`;
  return digits;
}

async function sendSms({ to, message }) {
  await axios.post(
    'https://sms.arkesel.com/api/v2/sms/send',
    {
      sender: process.env.ARKESEL_SENDER_ID,
      message,
      recipients: [toArkeselFormat(to)],
    },
    {
      headers: {
        'api-key': process.env.ARKESEL_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

module.exports = { sendSms };
