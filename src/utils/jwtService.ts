import { User, AuthTokens } from '../types/auth';
import { CryptoService } from './cryptoService';

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
  private static readonly JWT_SECRET = process.env.VITE_JWT_SECRET || 'your-super-secret-key-change-in-production';

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

    const accessToken = await this.signToken(accessPayload);
    const refreshToken = await this.signToken(refreshPayload);

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date((now + this.ACCESS_TOKEN_EXPIRY) * 1000),
      tokenType: 'Bearer'
    };
  }

  static async verifyToken(token: string, expectedType: 'access' | 'refresh'): Promise<JWTPayload | null> {
    try {
      const payload = await this.verifyTokenSignature(token);
      
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
    const payload = await this.verifyToken(refreshToken, 'refresh');
    if (!payload) return null;

    // Create new access token with same session
    const now = Math.floor(Date.now() / 1000);
    const newAccessPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + this.ACCESS_TOKEN_EXPIRY,
      type: 'access'
    };

    const accessToken = await this.signToken(newAccessPayload);

    return {
      accessToken,
      refreshToken, // Keep the same refresh token
      expiresAt: new Date((now + this.ACCESS_TOKEN_EXPIRY) * 1000),
      tokenType: 'Bearer'
    };
  }

  static extractPayload(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.extractPayload(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  static getTokenExpirationTime(token: string): Date | null {
    const payload = this.extractPayload(token);
    if (!payload) return null;

    return new Date(payload.exp * 1000);
  }

  // Private methods
  private static async signToken(payload: JWTPayload): Promise<string> {
    // In a production environment, use a proper JWT library like jose
    // This is a simplified implementation for demo purposes
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private static async verifyTokenSignature(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      
      // Verify signature
      const expectedSignature = await this.createSignature(`${header}.${payload}`);
      if (signature !== expectedSignature) {
        return null;
      }

      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private static async createSignature(data: string): Promise<string> {
    // In production, use proper HMAC-SHA256
    // This is a simplified implementation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.JWT_SECRET);
    const messageData = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

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