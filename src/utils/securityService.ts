import { SecurityEvent } from '../types/auth';
import { AuditService } from './auditService';

export class SecurityService {
  private static readonly SUSPICIOUS_PATTERNS = {
    rapidRequests: { threshold: 100, windowMs: 60000 }, // 100 requests per minute
    failedLogins: { threshold: 5, windowMs: 300000 }, // 5 failed logins in 5 minutes
    dataExports: { threshold: 10, windowMs: 3600000 }, // 10 exports per hour
  };

  private static blockedIPs = new Set<string>();
  private static suspiciousIPs = new Map<string, { count: number; lastSeen: number }>();

  // IP Management
  static blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress);
    
    AuditService.logSecurityEvent({
      type: 'suspicious_activity',
      details: { action: 'ip_blocked', reason, ipAddress },
      ipAddress,
      severity: 'critical'
    });

    // Persist blocked IPs
    this.persistBlockedIPs();
  }

  static unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    this.persistBlockedIPs();
  }

  static isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  static getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // Suspicious Activity Detection
  static async detectSuspiciousActivity(
    action: string,
    ipAddress: string,
    userId?: string
  ): Promise<{ suspicious: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' }> {
    
    // Check if IP is already blocked
    if (this.isIPBlocked(ipAddress)) {
      return {
        suspicious: true,
        reason: 'IP address is blocked',
        severity: 'high'
      };
    }

    // Analyze request patterns
    const patternAnalysis = await this.analyzeRequestPatterns(action, ipAddress, userId);
    if (patternAnalysis.suspicious) {
      return patternAnalysis;
    }

    // Check for known attack patterns
    const attackAnalysis = this.detectAttackPatterns(action, ipAddress);
    if (attackAnalysis.suspicious) {
      return attackAnalysis;
    }

    // Geolocation analysis (simplified)
    const geoAnalysis = await this.analyzeGeolocation(ipAddress, userId);
    if (geoAnalysis.suspicious) {
      return geoAnalysis;
    }

    return { suspicious: false };
  }

  static async logSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    await AuditService.logSecurityEvent(eventData);

    // Auto-block IPs for critical events
    if (eventData.severity === 'critical' && eventData.ipAddress) {
      this.markSuspiciousIP(eventData.ipAddress);
    }
  }

  // CSRF Protection
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false;
    return this.constantTimeCompare(token, expectedToken);
  }

  // XSS Prevention
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  static validateInput(input: string, type: 'email' | 'phone' | 'text' | 'number'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'phone':
        return /^\+?[\d\s\-\(\)]{10,}$/.test(input);
      case 'number':
        return /^\d+$/.test(input);
      case 'text':
        return input.length > 0 && input.length < 1000;
      default:
        return false;
    }
  }

  // Session Security
  static generateSecureSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static validateSessionIntegrity(sessionData: any): boolean {
    if (!sessionData || typeof sessionData !== 'object') return false;
    
    const requiredFields = ['id', 'userId', 'createdAt', 'lastActivity'];
    return requiredFields.every(field => sessionData[field] !== undefined);
  }

  // Security Headers
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': this.getCSPHeader()
    };
  }

  private static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-src https://checkout.razorpay.com https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
  }

  // Private helper methods
  private static async analyzeRequestPatterns(
    action: string,
    ipAddress: string,
    userId?: string
  ): Promise<{ suspicious: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' }> {
    
    const now = Date.now();
    const recentLogs = AuditService.getLogs({
      startDate: new Date(now - 300000), // Last 5 minutes
      limit: 1000
    });

    // Check for rapid requests from same IP
    const ipRequests = recentLogs.filter(log => log.ipAddress === ipAddress);
    if (ipRequests.length > this.SUSPICIOUS_PATTERNS.rapidRequests.threshold) {
      return {
        suspicious: true,
        reason: 'Too many requests from IP address',
        severity: 'high'
      };
    }

    // Check for failed login patterns
    if (action === 'login_failed') {
      const failedLogins = recentLogs.filter(log => 
        log.action === 'login_failed' && 
        log.ipAddress === ipAddress
      );
      
      if (failedLogins.length >= this.SUSPICIOUS_PATTERNS.failedLogins.threshold) {
        return {
          suspicious: true,
          reason: 'Multiple failed login attempts',
          severity: 'high'
        };
      }
    }

    // Check for excessive data exports
    if (action.includes('export')) {
      const exports = recentLogs.filter(log => 
        log.action.includes('export') && 
        (log.ipAddress === ipAddress || log.userId === userId)
      );
      
      if (exports.length >= this.SUSPICIOUS_PATTERNS.dataExports.threshold) {
        return {
          suspicious: true,
          reason: 'Excessive data export activity',
          severity: 'medium'
        };
      }
    }

    return { suspicious: false };
  }

  private static detectAttackPatterns(
    action: string,
    ipAddress: string
  ): { suspicious: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' } {
    
    // SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /exec\s*\(/i,
      /script\s*>/i
    ];

    // XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i
    ];

    const allPatterns = [...sqlPatterns, ...xssPatterns];
    
    if (allPatterns.some(pattern => pattern.test(action))) {
      return {
        suspicious: true,
        reason: 'Potential injection attack detected',
        severity: 'high'
      };
    }

    return { suspicious: false };
  }

  private static async analyzeGeolocation(
    ipAddress: string,
    userId?: string
  ): Promise<{ suspicious: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' }> {
    
    // In production, use a geolocation service
    // For now, just check for private/local IPs
    const privateIPPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^localhost$/
    ];

    const isPrivateIP = privateIPPatterns.some(pattern => pattern.test(ipAddress));
    
    if (!isPrivateIP && userId) {
      // Check if this is a new location for the user
      const userLogs = AuditService.getLogs({
        userId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        limit: 100
      });

      const knownIPs = new Set(userLogs.map(log => log.ipAddress));
      
      if (!knownIPs.has(ipAddress)) {
        return {
          suspicious: true,
          reason: 'Login from new location',
          severity: 'medium'
        };
      }
    }

    return { suspicious: false };
  }

  private static markSuspiciousIP(ipAddress: string): void {
    const current = this.suspiciousIPs.get(ipAddress) || { count: 0, lastSeen: 0 };
    current.count++;
    current.lastSeen = Date.now();
    
    this.suspiciousIPs.set(ipAddress, current);

    // Auto-block after multiple suspicious activities
    if (current.count >= 3) {
      this.blockIP(ipAddress, 'Multiple suspicious activities detected');
    }
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  private static persistBlockedIPs(): void {
    try {
      localStorage.setItem('blocked_ips', JSON.stringify(Array.from(this.blockedIPs)));
    } catch (error) {
      console.error('Failed to persist blocked IPs:', error);
    }
  }

  // Initialize from localStorage
  static initialize(): void {
    try {
      const blockedIPs = localStorage.getItem('blocked_ips');
      if (blockedIPs) {
        const ips = JSON.parse(blockedIPs);
        this.blockedIPs = new Set(ips);
      }
    } catch (error) {
      console.error('Failed to initialize security service:', error);
    }
  }

  // Cleanup old suspicious IP records
  static cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
}

// Initialize when service is imported
SecurityService.initialize();

// Cleanup suspicious IPs periodically
setInterval(() => {
  SecurityService.cleanup();
}, 60 * 60 * 1000); // Every hour