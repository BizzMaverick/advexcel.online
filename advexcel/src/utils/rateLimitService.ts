import { RateLimitConfig } from '../types/auth';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

export class RateLimitService {
  private static limits = new Map<string, RateLimitEntry>();
  
  private static readonly configs: Record<string, RateLimitConfig> = {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      skipSuccessfulRequests: true
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      skipSuccessfulRequests: false
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      skipSuccessfulRequests: true
    },
    otp: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10,
      skipSuccessfulRequests: true
    }
  };

  static async checkLimit(
    action: string, 
    identifier: string
  ): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const config = this.configs[action];
    if (!config) {
      return { allowed: true };
    }

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.limits.delete(key);
    }

    const currentEntry = this.limits.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    };

    // Check if currently blocked
    if (currentEntry.blocked && now < currentEntry.resetTime) {
      return {
        allowed: false,
        resetTime: Math.ceil((currentEntry.resetTime - now) / 1000)
      };
    }

    // Reset if window expired
    if (now > currentEntry.resetTime) {
      currentEntry.count = 0;
      currentEntry.resetTime = now + config.windowMs;
      currentEntry.blocked = false;
    }

    // Check if limit exceeded
    if (currentEntry.count >= config.maxRequests) {
      currentEntry.blocked = true;
      this.limits.set(key, currentEntry);
      
      return {
        allowed: false,
        resetTime: Math.ceil((currentEntry.resetTime - now) / 1000)
      };
    }

    // Increment counter
    currentEntry.count++;
    this.limits.set(key, currentEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - currentEntry.count
    };
  }

  static recordSuccess(action: string, identifier: string): void {
    const config = this.configs[action];
    if (!config || !config.skipSuccessfulRequests) return;

    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (entry && entry.count > 0) {
      entry.count = Math.max(0, entry.count - 1);
      this.limits.set(key, entry);
    }
  }

  static recordFailure(action: string, identifier: string): void {
    const config = this.configs[action];
    if (!config || config.skipFailedRequests) return;

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = this.limits.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    };

    entry.count++;
    this.limits.set(key, entry);
  }

  static blockIdentifier(action: string, identifier: string, durationMs: number): void {
    const key = `${action}:${identifier}`;
    const entry: RateLimitEntry = {
      count: 999,
      resetTime: Date.now() + durationMs,
      blocked: true
    };
    
    this.limits.set(key, entry);
  }

  static unblockIdentifier(action: string, identifier: string): void {
    const key = `${action}:${identifier}`;
    this.limits.delete(key);
  }

  static getRemainingAttempts(action: string, identifier: string): number {
    const config = this.configs[action];
    if (!config) return Infinity;

    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (!entry) return config.maxRequests;
    
    const now = Date.now();
    if (now > entry.resetTime) return config.maxRequests;
    
    return Math.max(0, config.maxRequests - entry.count);
  }

  static getResetTime(action: string, identifier: string): Date | null {
    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    return entry ? new Date(entry.resetTime) : null;
  }

  // Cleanup expired entries periodically
  static startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (now > entry.resetTime) {
          this.limits.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }
}

// Start cleanup when service is imported
RateLimitService.startCleanup();