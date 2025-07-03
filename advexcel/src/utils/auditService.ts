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