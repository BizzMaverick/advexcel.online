export class SecurityUtils {
  // Content Security Policy helpers
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  static validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    return allowedTypes.includes(fileExtension || '');
  }

  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });
  }

  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static sanitizeFilename(filename: string): string {
    // Remove or replace dangerous characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  }

  static validateCSVContent(content: string): boolean {
    // Basic CSV validation
    try {
      const lines = content.split('\n');
      if (lines.length === 0) return false;
      
      // Check for potential script injection
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(content));
    } catch {
      return false;
    }
  }

  static rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowKey = `rate_limit_${key}_${Math.floor(now / windowMs)}`;
    
    const current = parseInt(localStorage.getItem(windowKey) || '0');
    
    if (current >= maxRequests) {
      return false;
    }
    
    localStorage.setItem(windowKey, (current + 1).toString());
    
    // Clean up old rate limit entries
    setTimeout(() => {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('rate_limit_') && k !== windowKey) {
          localStorage.removeItem(k);
        }
      });
    }, windowMs);
    
    return true;
  }

  static detectSuspiciousActivity(action: string, metadata?: any): boolean {
    const suspiciousPatterns = [
      /script/i,
      /eval/i,
      /function\s*\(/i,
      /document\./i,
      /window\./i
    ];
    
    const actionString = JSON.stringify({ action, metadata });
    return suspiciousPatterns.some(pattern => pattern.test(actionString));
  }

  static logSecurityEvent(event: string, details: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event, details);
    }
    
    // In production, send to security monitoring service
    try {
      const securityLog = {
        timestamp: new Date().toISOString(),
        event,
        details,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Store locally for now, in production send to security service
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push(securityLog);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}