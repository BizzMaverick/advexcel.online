import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';

export class CryptoService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ENCRYPTION_KEY = 'your-encryption-key-change-in-production';

  // Password hashing using bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compareSync(password, hashedPassword);
  }

  // Encryption/Decryption
  static async encrypt(data: string): Promise<string> {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  static async decrypt(encryptedData: string): Promise<string> {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // OTP Generation
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateTOTP(secret: string): string {
    // In a real implementation, this would use TOTP algorithm
    // For demo, we'll generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static verifyTOTP(token: string, secret: string): boolean {
    // In a real implementation, this would verify against TOTP algorithm
    // For demo, we'll accept any 6-digit code
    return token.length === 6 && /^\d+$/.test(token);
  }

  // MFA/TOTP
  static generateMFASecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async generateMFAQRCode(secret: string, userId: string): Promise<string> {
    const issuer = 'Excel Pro AI';
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userId)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // In production, use a QR code library
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${otpauth}</svg>`)}`;
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // CSRF Protection
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static verifyCSRFToken(token: string, expectedToken: string): boolean {
    return this.constantTimeCompare(token, expectedToken);
  }

  // Secure random generation
  static generateSecureRandom(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Private helper methods
  private static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}