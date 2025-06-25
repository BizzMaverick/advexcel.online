import * as otplib from 'otplib';
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
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const key = await this.getEncryptionKey();
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  // MFA/TOTP
  static generateMFASecret(): string {
    return otplib.authenticator.generateSecret();
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

  static verifyTOTP(secret: string, token: string): boolean {
    return otplib.authenticator.verify({ token, secret });
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

  private static async getEncryptionKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.ENCRYPTION_KEY);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    return crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
}