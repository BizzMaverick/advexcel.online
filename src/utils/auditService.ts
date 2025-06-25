import { AuditLog, SecurityEvent } from '../types/auth';

export class AuditService {
  private static readonly MAX_LOGS = 10000;
  private static logs: AuditLog[] = [];
  private static securityEvents: SecurityEvent[] = [];

  static async log(logData: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userAgent' | 'riskLevel'>): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: this.generateId(),
        userId: await this.getCurrentUserId(),
        action: logData.action,
        resource: logData.resource,
        details: logData.details,
        ipAddress: logData.ipAddress,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        success: logData.success,
        riskLevel: this.calculateRiskLevel(logData.action, logData.details)
      };

      this.logs.push(auditLog);
      
      // Keep only recent logs to prevent memory issues
      if (this.logs.length > this.MAX_LOGS) {
        this.logs = this.logs.slice(-this.MAX_LOGS);
      }

      // Store in localStorage for persistence
      this.persistLogs();

      // Check for suspicious patterns
      await this.analyzeSuspiciousActivity(auditLog);

      // In production, send to audit service
      await this.sendToAuditService(auditLog);

    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async logSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        id: this.generateId(),
        type: eventData.type,
        userId: eventData.userId,
        details: eventData.details,
        ipAddress: eventData.ipAddress,
        timestamp: new Date(),
        severity: eventData.severity
      };

      this.securityEvents.push(securityEvent);

      // Keep only recent events
      if (this.securityEvents.length > this.MAX_LOGS) {
        this.securityEvents = this.securityEvents.slice(-this.MAX_LOGS);
      }

      this.persistSecurityEvents();

      // Handle critical security events
      if (eventData.severity === 'critical') {
        await this.handleCriticalSecurityEvent(securityEvent);
      }

      await this.sendSecurityEventToService(securityEvent);

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static getLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: 'low' | 'medium' | 'high';
    limit?: number;
  }): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action!));
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.riskLevel) {
        filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel);
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  static getSecurityEvents(filters?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filteredEvents = [...this.securityEvents];

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  static getAuditSummary(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): {
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    highRiskActions: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
    securityEvents: number;
  } {
    const now = new Date();
    const timeframeDuration = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const cutoffTime = new Date(now.getTime() - timeframeDuration[timeframe]);
    const recentLogs = this.logs.filter(log => log.timestamp >= cutoffTime);
    const recentEvents = this.securityEvents.filter(event => event.timestamp >= cutoffTime);

    const actionCounts = new Map<string, number>();
    const userCounts = new Map<string, number>();

    let successfulActions = 0;
    let failedActions = 0;
    let highRiskActions = 0;

    recentLogs.forEach(log => {
      if (log.success) successfulActions++;
      else failedActions++;

      if (log.riskLevel === 'high') highRiskActions++;

      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
      userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
    });

    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: recentLogs.length,
      successfulActions,
      failedActions,
      highRiskActions,
      topActions,
      topUsers,
      securityEvents: recentEvents.length
    };
  }

  static exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['ID', 'User ID', 'Action', 'Resource', 'Success', 'Risk Level', 'IP Address', 'Timestamp'];
      const rows = this.logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.resource,
        log.success.toString(),
        log.riskLevel,
        log.ipAddress,
        log.timestamp.toISOString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  static clearLogs(olderThan?: Date): void {
    if (olderThan) {
      this.logs = this.logs.filter(log => log.timestamp >= olderThan);
      this.securityEvents = this.securityEvents.filter(event => event.timestamp >= olderThan);
    } else {
      this.logs = [];
      this.securityEvents = [];
    }
    
    this.persistLogs();
    this.persistSecurityEvents();
  }

  // Private methods
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static async getCurrentUserId(): Promise<string> {
    try {
      // Get current user from auth service
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      return 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  private static calculateRiskLevel(action: string, details: Record<string, any>): 'low' | 'medium' | 'high' {
    // High risk actions
    const highRiskActions = [
      'user_deleted',
      'admin_access',
      'password_reset',
      'mfa_disabled',
      'bulk_data_export',
      'system_settings_changed'
    ];

    // Medium risk actions
    const mediumRiskActions = [
      'login_failed',
      'password_changed',
      'mfa_enabled',
      'data_export',
      'user_created'
    ];

    if (highRiskActions.some(risk => action.includes(risk))) {
      return 'high';
    }

    if (mediumRiskActions.some(risk => action.includes(risk))) {
      return 'medium';
    }

    // Check for suspicious patterns in details
    if (details.failedAttempts && details.failedAttempts > 3) {
      return 'high';
    }

    if (details.suspiciousActivity) {
      return 'high';
    }

    return 'low';
  }

  private static async analyzeSuspiciousActivity(log: AuditLog): Promise<void> {
    // Check for rapid successive failed logins
    if (log.action === 'login_failed') {
      const recentFailures = this.logs.filter(l => 
        l.action === 'login_failed' &&
        l.ipAddress === log.ipAddress &&
        l.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
      );

      if (recentFailures.length >= 5) {
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          userId: log.userId,
          details: { 
            reason: 'Multiple failed login attempts',
            count: recentFailures.length,
            ipAddress: log.ipAddress
          },
          ipAddress: log.ipAddress,
          severity: 'warning'
        });
      }
    }

    // Check for unusual access patterns
    if (log.action.includes('admin') && log.riskLevel === 'high') {
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        userId: log.userId,
        details: { 
          reason: 'High-risk admin action',
          action: log.action
        },
        ipAddress: log.ipAddress,
        severity: 'critical'
      });
    }
  }

  private static async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // In production, this would trigger alerts, notifications, etc.
    console.warn('CRITICAL SECURITY EVENT:', event);
    
    // Could implement:
    // - Email alerts to security team
    // - Slack/Teams notifications
    // - Automatic account lockdown
    // - IP blocking
  }

  private static persistLogs(): void {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs.slice(-1000))); // Keep last 1000
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }

  private static persistSecurityEvents(): void {
    try {
      localStorage.setItem('security_events', JSON.stringify(this.securityEvents.slice(-1000)));
    } catch (error) {
      console.error('Failed to persist security events:', error);
    }
  }

  private static async sendToAuditService(log: AuditLog): Promise<void> {
    // In production, send to external audit service
    // This could be a SIEM system, log aggregation service, etc.
    try {
      // await fetch('/api/audit/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(log)
      // });
    } catch (error) {
      console.error('Failed to send audit log to service:', error);
    }
  }

  private static async sendSecurityEventToService(event: SecurityEvent): Promise<void> {
    // In production, send to security monitoring service
    try {
      // await fetch('/api/security/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Failed to send security event to service:', error);
    }
  }

  // Initialize from localStorage
  static initialize(): void {
    try {
      const storedLogs = localStorage.getItem('audit_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }

      const storedEvents = localStorage.getItem('security_events');
      if (storedEvents) {
        this.securityEvents = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to initialize audit service:', error);
    }
  }
}

// Initialize when service is imported
AuditService.initialize();