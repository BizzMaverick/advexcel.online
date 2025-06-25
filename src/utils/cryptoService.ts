export class CryptoService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ENCRYPTION_KEY = 'your-encryption-key-change-in-production';

  // Password hashing using Web Crypto API (Argon2 alternative)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.generateSalt());
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // In production, use proper bcrypt or Argon2
    // This is a simplified implementation
    const testHash = await this.hashPassword(password);
    return this.constantTimeCompare(testHash, hashedPassword);
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
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    return this.base32Encode(array);
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
    // Simplified TOTP verification
    // In production, use a proper TOTP library
    const timeStep = Math.floor(Date.now() / 30000);
    const expectedToken = this.generateTOTP(secret, timeStep);
    
    // Allow for time drift (check current and previous time step)
    const previousToken = this.generateTOTP(secret, timeStep - 1);
    
    return this.constantTimeCompare(token, expectedToken) || 
           this.constantTimeCompare(token, previousToken);
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

  private static base32Encode(buffer: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;
    
    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }
    
    return result;
  }

  private static generateTOTP(secret: string, timeStep: number): string {
    // Simplified TOTP generation
    // In production, use a proper TOTP library
    const hash = timeStep.toString() + secret;
    let code = 0;
    
    for (let i = 0; i < hash.length; i++) {
      code += hash.charCodeAt(i);
    }
    
    return (code % 1000000).toString().padStart(6, '0');
  }
}