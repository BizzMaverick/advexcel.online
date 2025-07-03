import { User, Permission, UserRole } from '../types/auth';
import { JWTService } from '../utils/jwtService';
import { SecurityService } from '../utils/securityService';
import { AuditService } from '../utils/auditService';
import { RateLimitService } from '../utils/rateLimitService';

export interface AuthMiddlewareOptions {
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  skipRateLimiting?: boolean;
  securityChecks?: boolean;
  auditAction?: string;
}

export class AuthMiddleware {
  static async authenticate(
    request: Request,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ 
    authenticated: boolean; 
    user?: User; 
    error?: string;
    statusCode?: number;
  }> {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { 
          authenticated: false, 
          error: 'No authentication token provided',
          statusCode: 401
        };
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return { 
          authenticated: false, 
          error: 'Invalid authentication token',
          statusCode: 401
        };
      }

      // Verify token
      const payload = JWTService.extractPayload(token);
      if (!payload || JWTService.isTokenExpired(token)) {
        return { 
          authenticated: false, 
          error: 'Invalid or expired token',
          statusCode: 401
        };
      }

      // Get user from payload
      const user = await this.getUserFromPayload(payload);
      if (!user) {
        return { 
          authenticated: false, 
          error: 'User not found',
          statusCode: 401
        };
      }

      // Rate limiting check
      if (!options.skipRateLimiting) {
        const ipAddress = this.getClientIP(request);
        const rateLimitCheck = await RateLimitService.checkLimit('api', `${user.id}:${ipAddress}`);
        
        if (!rateLimitCheck.allowed) {
          return { 
            authenticated: false, 
            error: `Rate limit exceeded. Try again in ${rateLimitCheck.resetTime} seconds`,
            statusCode: 429
          };
        }
      }

      // Security checks
      if (options.securityChecks !== false) {
        const securityCheck = await this.performSecurityChecks(request, user);
        if (!securityCheck.passed) {
          return { 
            authenticated: false, 
            error: securityCheck.reason,
            statusCode: 403
          };
        }
      }

      // Permission check
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasPermission = options.requiredPermissions.every(permission => 
          user.permissions.includes(permission) || user.role === UserRole.ADMIN
        );

        if (!hasPermission) {
          return { 
            authenticated: false, 
            error: 'Insufficient permissions',
            statusCode: 403
          };
        }
      }

      // Role check
      if (options.requiredRole && user.role !== options.requiredRole && user.role !== UserRole.ADMIN) {
        return { 
          authenticated: false, 
          error: 'Insufficient role',
          statusCode: 403
        };
      }

      // Audit log
      if (options.auditAction) {
        await AuditService.log({
          action: options.auditAction,
          resource: new URL(request.url).pathname,
          details: { userId: user.id },
          ipAddress: this.getClientIP(request),
          success: true
        });
      }

      return { authenticated: true, user };

    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        authenticated: false, 
        error: 'Authentication failed',
        statusCode: 500
      };
    }
  }

  static async refreshToken(request: Request): Promise<{
    success: boolean;
    newToken?: string;
    error?: string;
  }> {
    try {
      // Get refresh token from request
      const refreshToken = request.headers.get('X-Refresh-Token');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token provided' };
      }

      // Verify refresh token
      const payload = JWTService.extractPayload(refreshToken);
      if (!payload || JWTService.isTokenExpired(refreshToken)) {
        return { success: false, error: 'Invalid or expired refresh token' };
      }

      // Get user from payload
      const user = await this.getUserFromPayload(payload);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Generate new access token
      const tokens = await JWTService.refreshAccessToken(refreshToken);
      if (!tokens) {
        return { success: false, error: 'Failed to refresh token' };
      }

      return { success: true, newToken: tokens.accessToken };

    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  static getSecurityHeaders(): Record<string, string> {
    return SecurityService.getSecurityHeaders();
  }

  // Private helper methods
  private static async getUserFromPayload(payload: any): Promise<User | null> {
    // In production, fetch user from database
    // For demo, we'll use localStorage
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return null;

      const user = JSON.parse(userData);
      return user.id === payload.userId ? user : null;
    } catch {
      return null;
    }
  }

  private static getClientIP(request: Request): string {
    // In production, extract from X-Forwarded-For or similar
    return '127.0.0.1';
  }

  private static async performSecurityChecks(
    request: Request,
    user: User
  ): Promise<{ passed: boolean; reason?: string }> {
    const ipAddress = this.getClientIP(request);
    
    // Check if IP is blocked
    if (SecurityService.isIPBlocked(ipAddress)) {
      return { passed: false, reason: 'IP address is blocked' };
    }

    // Check IP whitelist if configured
    if (user.security.ipWhitelist && user.security.ipWhitelist.length > 0) {
      if (!user.security.ipWhitelist.includes(ipAddress)) {
        return { passed: false, reason: 'IP address not in whitelist' };
      }
    }

    // Check for suspicious activity
    const url = new URL(request.url);
    const action = url.pathname;
    
    const securityCheck = await SecurityService.detectSuspiciousActivity(
      action,
      ipAddress,
      user.id
    );

    if (securityCheck.suspicious) {
      return { passed: false, reason: securityCheck.reason || 'Suspicious activity detected' };
    }

    return { passed: true };
  }
}