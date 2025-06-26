const nodemailer = require('nodemailer');

// Mock database for storing OTPs (in production, use a real database)
const otpStore = new Map();

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with 5-minute expiration
function storeOTP(identifier, otp) {
  otpStore.set(identifier, {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0
  });
}

// Send OTP via email
async function sendEmailOTP(email, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log(`[DEMO MODE] Email OTP for ${email}: ${otp}`);
    return { success: true, message: 'OTP sent to email (demo mode)' };
  }

  try {
    await emailTransporter.sendMail({
      from: `"Excel Pro AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Excel Pro AI Verification Code',
      text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2563eb;">Excel Pro AI Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px; color: #6b7280;">This code will expire in 5 minutes.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    });
    return { success: true, message: 'OTP sent to email' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send email' };
  }
}

// Send OTP via SMS (mock implementation)
async function sendSMSOTP(phoneNumber, otp) {
  // In a real implementation, this would use Twilio or another SMS service
  console.log(`[DEMO MODE] SMS OTP for ${phoneNumber}: ${otp}`);
  return { success: true, message: 'OTP sent to phone (demo mode)' };
}

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

    // Generate OTP
    const otp = generateOTP();
    storeOTP(identifier, otp);

    // Send OTP via email or SMS
    let result;
    if (type === 'email' || identifier.includes('@')) {
      result = await sendEmailOTP(identifier, otp);
    } else {
      result = await sendSMSOTP(identifier, otp);
    }

    if (!result.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: result.message })
      };
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
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    };
  }
};