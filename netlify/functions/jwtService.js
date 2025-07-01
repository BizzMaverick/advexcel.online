const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.JWTService = {
  generateToken: (user, type = 'access') => {
    const payload = { userId: user.id, role: user.role };
    const expiresIn = type === 'access' ? '1h' : '7d';
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
};
