const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('verify-otp function loaded.');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  try {
    const { identifier, otp } = JSON.parse(event.body || '{}');

    console.log('Received event:', event.body);

    if (!identifier || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Identifier and OTP are required' }),
      };
    }

    // DEMO: Replace this with real verification logic
    console.log(`[DEMO] Verifying OTP for ${identifier}: ${otp}`);

    // Find user by email
    console.log('Looking up user for OTP verification:', identifier);
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    const user = rows[0];
    console.log('User found for OTP verification:', !!user, user && { id: user.id, email: user.email });
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'User not found' }),
      };
    }
    // Mark as verified and set trial_expires_at
    const trialExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    await pool.query('UPDATE users SET is_verified = TRUE, trial_expires_at = $1 WHERE email = $2', [trialExpiresAt, identifier]);
    console.log('User marked as verified and trial set:', { email: identifier, trialExpiresAt });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Verification successful. Free trial started.',
        trialExpiresAt
      }),
    };
  } catch (error) {
    console.error('Error processing OTP verification:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
        stack: error.stack
      }),
    };
  }
};
