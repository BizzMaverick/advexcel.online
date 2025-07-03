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
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { identifier, type } = body;

    if (!identifier) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Email or phone number is required' })
      };
    }

    // Check if user exists
    const { rows: userRows } = await pool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    const user = userRows[0];
    if (!user) {
      console.log('User not found for OTP:', identifier);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'User not found' })
      };
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in a new otps table (create if not exists)
    await pool.query(
      'CREATE TABLE IF NOT EXISTS otps (id SERIAL PRIMARY KEY, email TEXT, otp TEXT, expires_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())'
    );
    await pool.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [identifier, otp, expiresAt]
    );
    console.log('OTP generated and stored:', { identifier, otp, expiresAt });

    // Send OTP via email or SMS
    if (identifier.includes('@')) {
      // Send via email
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: identifier,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${otp}`,
          html: `<p>Your verification code is: <b>${otp}</b></p>`
        });
        console.log('OTP sent via email to:', identifier);
      } catch (emailErr) {
        console.error('Error sending OTP email:', emailErr);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, message: 'Failed to send verification email', error: emailErr.message })
        };
      }
    } else {
      // Send via SMS (Twilio integration - future)
      // try {
      //   await twilioClient.messages.create({
      //     body: `Your verification code is: ${otp}`,
      //     from: process.env.TWILIO_PHONE_NUMBER,
      //     to: identifier
      //   });
      //   console.log('OTP sent via SMS to:', identifier);
      // } catch (smsErr) {
      //   console.error('Error sending OTP SMS:', smsErr);
      //   return {
      //     statusCode: 500,
      //     headers,
      //     body: JSON.stringify({ success: false, message: 'Failed to send verification SMS', error: smsErr.message })
      //   };
      // For now, SMS OTP is not active. Only email OTP is sent.
      console.log(`SMS OTP logic is commented out. OTP for ${identifier}: ${otp}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Verification code sent to your ${type === 'email' || identifier.includes('@') ? 'email' : 'phone'}`,
        // For demo purposes only - remove in production
        demo: { otp }
      })
    };
  } catch (error) {
    console.error('Error in send-otp:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message, stack: error.stack })
    };
  }
};