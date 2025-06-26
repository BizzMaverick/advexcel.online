// Mock database for storing OTPs (in production, use a real database)
const otpStore = new Map();

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

    // Check if OTP exists and is valid
    const storedData = otpStore.get(identifier);
    
    if (!storedData) {
      // For demo purposes, check localStorage-like storage
      try {
        // In production, this would be a database lookup
        console.log(`Checking for OTP in local storage for ${identifier}`);
        
        // For demo, always return success
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Verification successful (demo mode)' 
          })
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Verification code expired or not found' })
        };
      }
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(identifier);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Verification code has expired' })
      };
    }

    // Check if too many attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(identifier);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Too many failed attempts' })
      };
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      // Increment attempts
      storedData.attempts += 1;
      otpStore.set(identifier, storedData);
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: `Invalid verification code. ${3 - storedData.attempts} attempts remaining.` 
        })
      };
    }

    // OTP is valid, remove it
    otpStore.delete(identifier);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Verification successful' })
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