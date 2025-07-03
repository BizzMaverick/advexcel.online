// If you see a 'Cannot find module "jwt-decode"' error, run: npm install jwt-decode
// If you see a 'Cannot find module ../types/auth' error, ensure types/auth.ts exists and is correct.
import { jwtDecode } from 'jwt-decode';
import { AuthTokens } from '../types/auth';

interface JWTPayload {
  userId: string;
  email?: string;
  role: string;
  permissions: string[];
  sessionId?: string;
  deviceFingerprint?: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export class JWTService {
  // Decode a JWT token and return its payload
  static extractPayload(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  }

  // Check if a token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded) return true;
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  // Get token expiration time as Date
  static getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
}
// All signing, verification, and refresh logic must be handled by backend API endpoints. 
