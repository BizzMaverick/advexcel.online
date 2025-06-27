/**
 * Service for accessing environment variables with proper fallbacks
 */
export class EnvironmentService {
  // API Configuration
  static getApiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'https://advexcel.online';
  }

  // Authentication
  static getJwtSecret(): string {
    return import.meta.env.VITE_JWT_SECRET || 'default_jwt_secret_key';
  }

  static getSessionSecret(): string {
    return import.meta.env.VITE_SESSION_SECRET || 'default_session_secret_key';
  }

  // Email Configuration
  static getSmtpConfig(): {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  } {
    return {
      host: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
      secure: import.meta.env.VITE_SMTP_SECURE === 'true',
      user: import.meta.env.VITE_SMTP_USER || '',
      password: import.meta.env.VITE_SMTP_PASSWORD || ''
    };
  }

  // Environment Detection
  static isDevelopment(): boolean {
    return import.meta.env.DEV === true;
  }

  static isProduction(): boolean {
    return import.meta.env.PROD === true;
  }

  // Feature Flags
  static isFeatureEnabled(featureName: string): boolean {
    const featureFlag = `VITE_FEATURE_${featureName.toUpperCase()}`;
    return import.meta.env[featureFlag] === 'true';
  }
}