import { User, AuthTokens } from '../types/auth';
import { CryptoService } from './cryptoService';
import { EnvironmentService } from './environmentService';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email?: string;
  role: string;
  permissions: string[];
  sessionId: string;
  deviceFingerprint: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private static readonly JWT_SECRET = EnvironmentService.getJwtSecret();

  static async generateTokens(user: User): Promise<AuthTokens> {
    const deviceFingerprint = this.generateDeviceFingerprint();
    const sessionId = this.generateSessionId();
    const now = Math.floor(Date.now() / 1000);

    // Access token payload
    const accessPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      sessionId,
      deviceFingerprint,
      iat: now,
      exp: now + this.ACCESS_TOKEN_EXPIRY,
      type: 'access'
    };

    // Refresh token payload
    const refreshPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      sessionId,
      deviceFingerprint,
      iat: now,
      exp: now + this.REFRESH_TOKEN_EXPIRY,
      type: 'refresh'
    };

    const accessToken = jwt.sign(accessPayload, this.JWT_SECRET);
    const refreshToken = jwt.sign(refreshPayload, this.JWT_SECRET);

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date((now + this.ACCESS_TOKEN_EXPIRY) * 1000),
      tokenType: 'Bearer'
    };
  }

  static async verifyToken(token: string, expectedType: 'access' | 'refresh'): Promise<JWTPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      if (!payload || payload.type !== expectedType) {
        return null;
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      // Verify device fingerprint
      const currentFingerprint = this.generateDeviceFingerprint();
      if (payload.deviceFingerprint !== currentFingerprint) {
        // Device fingerprint mismatch - potential security issue
        console.warn('Device fingerprint mismatch detected');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as JWTPayload;
      if (!payload || payload.type !== 'refresh') return null;

      // Create new access token with same session
      const now = Math.floor(Date.now() / 1000);
      const newAccessPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: now + this.ACCESS_TOKEN_EXPIRY,
        type: 'access'
      };

      const accessToken = jwt.sign(newAccessPayload, this.JWT_SECRET);

      return {
        accessToken,
        refreshToken, // Keep the same refresh token
        expiresAt: new Date((now + this.ACCESS_TOKEN_EXPIRY) * 1000),
        tokenType: 'Bearer'
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  static extractPayload(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded) return true;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  static getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded) return null;

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  // Private methods
  private static generateDeviceFingerprint(): string {
    // Generate a consistent device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown'
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}