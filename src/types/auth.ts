export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
  role: UserRole;
  permissions: Permission[];
  profile: UserProfile;
  security: SecuritySettings;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  company?: string;
  department?: string;
}

export interface SecuritySettings {
  mfaEnabled: boolean;
  mfaSecret?: string;
  trustedDevices: TrustedDevice[];
  lastPasswordChange: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  ipWhitelist?: string[];
  sessionTimeout: number; // in minutes
}

export interface TrustedDevice {
  id: string;
  deviceFingerprint: string;
  deviceName: string;
  lastUsed: Date;
  ipAddress: string;
  userAgent: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  // Data permissions
  READ_DATA = 'read:data',
  WRITE_DATA = 'write:data',
  DELETE_DATA = 'delete:data',
  EXPORT_DATA = 'export:data',
  IMPORT_DATA = 'import:data',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view:analytics',
  CREATE_REPORTS = 'create:reports',
  SHARE_REPORTS = 'share:reports',
  
  // System permissions
  MANAGE_USERS = 'manage:users',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
  MANAGE_SETTINGS = 'manage:settings',
  
  // Advanced features
  USE_AI_FEATURES = 'use:ai_features',
  CREATE_FORMULAS = 'create:formulas',
  MANAGE_WORKBOOKS = 'manage:workbooks'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
  mfaCode?: string;
  rememberDevice?: boolean;
}

export interface SignupData {
  identifier: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  acceptTerms: boolean;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_change' | 'mfa_setup' | 'suspicious_activity';
  userId?: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface SessionData {
  id: string;
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}