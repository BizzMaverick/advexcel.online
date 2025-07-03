const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

exports.JWTService = {
  generateToken: (user, type = 'access') => {
    const payload = { 
      userId: user.id, 
      role: user.role,
      permissions: user.permissions || [],
      email: user.email,
      type
    };
    
    const expiresIn = type === 'access' ? '1h' : '7d';
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  },
  
  refreshToken: (refreshToken) => {
    try {
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, JWT_SECRET);
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      // Create a new access token
      const accessToken = jwt.sign(
        { ...payload, type: 'access' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  },
  
  decodeToken: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }
};