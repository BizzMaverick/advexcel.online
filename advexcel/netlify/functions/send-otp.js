const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const nodemailer = require('nodemailer');

console.log('send-otp function loaded.');

// Setup Nodemailer transporter for GoDaddy SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// --- Twilio SMS OTP integration (future) ---
// (Twilio require/import removed to prevent Netlify bundling error)
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// --- End Twilio SMS OTP integration ---

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "send-otp function is working!" })
  };
};