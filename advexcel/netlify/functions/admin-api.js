const { AuthService } = require('./authService');
const { AuditService } = require('./auditService');
const { SecurityService } = require('./securityService');
const { JWTService } = require('./jwtService');
const { AdminService } = require('./adminService');

// Middleware to verify admin access
const verifyAdminAccess = async (event) => {
  // Get token from Authorization header
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAdmin: false,
      error: 'No authentication token provided',
      statusCode: 401
    };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return {
      isAdmin: false,
      error: 'Invalid authentication token',
      statusCode: 401
    };
  }

  try {
    // Verify token
    const payload = await JWTService.verifyToken(token, 'access');
    if (!payload) {
      return {
        isAdmin: false,
        error: 'Invalid or expired token',
        statusCode: 401
      };
    }

    // Get user from payload
    const user = await AuthService.findUserById(payload.userId);
    if (!user) {
      return {
        isAdmin: false,
        error: 'User not found',
        statusCode: 401
      };
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return {
        isAdmin: false,
        error: 'Admin access required',
        statusCode: 403
      };
    }

    return {
      isAdmin: true,
      user
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return {
      isAdmin: false,
      error: 'Authentication failed',
      statusCode: 500
    };
  }
};

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

  // Verify admin access
  const adminCheck = await verifyAdminAccess(event);
  if (!adminCheck.isAdmin) {
    return {
      statusCode: adminCheck.statusCode || 403,
      headers,
      body: JSON.stringify({ success: false, message: adminCheck.error })
    };
  }

  // Process admin API requests
  const path = event.path.replace(/^\/api\/admin\/?/, '');
  
  try {
    // Get all users
    if (path === 'users' && event.httpMethod === 'GET') {
      const users = await AuthService.getAllUsers();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: users })
      };
    }
    
    // Add new user
    if (path === 'users' && event.httpMethod === 'POST') {
      const { userData, password } = JSON.parse(event.body);
      
      if (!userData || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'User data and password are required' })
        };
      }
      
      const result = await AdminService.addUser(userData, password);
      
      return {
        statusCode: result.success ? 201 : 400,
        headers,
        body: JSON.stringify(result)
      };
    }
    
    // Update user
    if (path.startsWith('users/') && event.httpMethod === 'PUT') {
      const userId = path.replace('users/', '');
      const userData = JSON.parse(event.body);
      
      if (!userData) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'User data is required' })
        };
      }
      
      const result = await AdminService.updateUser({ ...userData, id: userId });
      
      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result)
      };
    }
    
    // Delete user
    if (path.startsWith('users/') && event.httpMethod === 'DELETE') {
      const userId = path.replace('users/', '');
      
      // Prevent deleting self
      if (userId === adminCheck.user.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Cannot delete your own account' })
        };
      }
      
      const result = await AdminService.deleteUser(userId);
      
      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result)
      };
    }
    
    // Get system stats
    if (path === 'stats' && event.httpMethod === 'GET') {
      const stats = await AdminService.getSystemStats();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: stats })
      };
    }
    
    // Get audit logs
    if (path === 'logs' && event.httpMethod === 'GET') {
      const logs = AuditService.getLogs();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: logs })
      };
    }
    
    // Endpoint not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: 'API endpoint not found' })
    };
    
  } catch (error) {
    console.error('Admin API error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Internal server error' })
    };
  }
};