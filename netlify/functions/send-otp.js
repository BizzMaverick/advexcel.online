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

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real implementation, we would send the OTP via email or SMS
    // For demo purposes, we'll just return it in the response
    console.log(`[DEMO] OTP for ${identifier}: ${otp}`);

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