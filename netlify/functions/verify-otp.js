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

    if (!identifier || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Identifier and OTP are required' }),
      };
    }

    // DEMO: Replace this with real verification logic
    console.log(`[DEMO] Verifying OTP for ${identifier}: ${otp}`);

    // Find user by email or phone (for demo, only email is supported)
    const { users } = require('./auth');
    const user = users.find(u => u.email === identifier);
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'User not found' }),
      };
    }
    // Mark as verified and set trialExpiresAt
    user.isVerified = true;
    user.trialExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Verification successful. Free trial started.',
        trialExpiresAt: user.trialExpiresAt
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
      }),
    };
  }
};
