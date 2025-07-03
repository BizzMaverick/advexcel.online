const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

// In-memory user store for demo purposes
// In production, this would be a database
const users = [];

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/auth\/?/, '');
  
  try {
    // Login endpoint
    if (path === 'login' && event.httpMethod === 'POST') {
      const { email, password } = JSON.parse(event.body);
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Email and password are required' })
        };
      }
      
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, message: 'Invalid credentials' })
        };
      }
      
      // Require verification
      if (!user.isVerified) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ success: false, message: 'Account not verified. Please verify your email or phone.' })
        };
      }
      
      // Check if trial is expired
      if (user.trialExpiresAt && new Date(user.trialExpiresAt) < new Date()) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ success: false, message: 'Your free trial has expired.' })
        };
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, message: 'Invalid credentials' })
        };
      }
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            trialExpiresAt: user.trialExpiresAt
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            tokenType: 'Bearer'
          }
        })
      };
    }
    
    // Register endpoint
    if (path === 'register' && event.httpMethod === 'POST') {
      const { email, password, firstName, lastName } = JSON.parse(event.body);
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Email and password are required' })
        };
      }
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'User already exists' })
        };
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'user',
        createdAt: new Date(),
        isVerified: false,
        trialExpiresAt: null
      };
      
      users.push(newUser);
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const refreshToken = jwt.sign(
        { userId: newUser.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            tokenType: 'Bearer'
          }
        })
      };
    }
    
    // Refresh token endpoint
    if (path === 'refresh' && event.httpMethod === 'POST') {
      const { refreshToken } = JSON.parse(event.body);
      
      if (!refreshToken) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Refresh token is required' })
        };
      }
      
      try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
          throw new Error('Invalid token type');
        }
        
        // Find user
        const user = users.find(u => u.id === decoded.userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        // Generate new access token
        const accessToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            tokens: {
              accessToken,
              refreshToken, // Return the same refresh token
              expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
              tokenType: 'Bearer'
            }
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, message: 'Invalid or expired refresh token' })
        };
      }
    }
    
    // Verify token endpoint
    if (path === 'verify' && event.httpMethod === 'POST') {
      const { token } = JSON.parse(event.body);
      
      if (!token) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Token is required' })
        };
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            valid: true,
            payload: decoded
          })
        };
      } catch (error) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            valid: false,
            message: error.message
          })
        };
      }
    }
    
    // Endpoint not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: 'Endpoint not found' })
    };
    
  } catch (error) {
    console.error('Auth function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    };
  }
};