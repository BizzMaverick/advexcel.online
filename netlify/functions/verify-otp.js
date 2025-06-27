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
    const { identifier, otp } = body;

    if (!identifier || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Identifier and OTP are required' })
      };
    }

    // In a real implementation, we would verify the OTP against a database
    // For demo purposes, we'll just return success
    console.log(`[DEMO] Verifying OTP for ${identifier}: ${otp}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Verification successful (demo mode)' 
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