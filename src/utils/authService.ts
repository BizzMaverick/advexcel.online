import { DeviceService } from './deviceService';
import { SecurityService } from './securityService';
import { AuditService } from './auditService';
import { RateLimitService } from './rateLimitService';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  SignupData, 
  UserRole, 
  Permission,
  MFASetup,
  SecuritySettings,
  TrustedDevice
} from '../types/auth';
import { JWTService } from './jwtService';
import { CryptoService } from './cryptoService';
import { EnvironmentService } from './environmentService';

export class AuthService {
  private static readonly API_BASE = EnvironmentService.getApiBaseUrl();
  private static readonly TOKEN_STORAGE_KEY = 'auth_tokens';
  private static readonly USER_STORAGE_KEY = 'user_data';
  private static readonly SESSION_STORAGE_KEY = 'session_data';

  // Authentication Methods
  static async login(credentials: LoginCredentials): Promise<{ 
    success: boolean; 
    user?: User; 
    tokens?: AuthTokens;
    requiresMFA?: boolean;
    message: string 
  }> {
    try {
      // Rate limiting check
      const rateLimitCheck = await RateLimitService.checkLimit('login', credentials.identifier);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many login attempts. Try again in ${rateLimitCheck.resetTime} seconds.`);
      }

      // Device fingerprinting
      const deviceFingerprint = DeviceService.generateDeviceFingerprint();
      const ipAddress = await this.getClientIP();

      // Audit log for login attempt
      await AuditService.log({
        action: 'login_attempt',
        resource: 'auth',
        details: { identifier: credentials.identifier, deviceFingerprint },
        ipAddress,
        success: false // Will update if successful
      });

      try {
        // Try to use API endpoint first
        const response = await fetch(`${this.API_BASE}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.user && result.tokens) {
            // Store tokens securely
            await this.storeTokensSecurely(result.tokens);
            await this.storeUserData(result.user);
            
            // Success audit log
            await AuditService.log({
              action: 'login_success',
              resource: 'auth',
              details: { userId: result.user.id },
              ipAddress,
              success: true
            });
            
            return result;
          } else {
            throw new Error(result.message || 'Login failed');
          }
        }
        
        // If API call fails, fall back to local authentication
        throw new Error('API unavailable, using local authentication');
      } catch (apiError) {
        console.warn('API login failed, using local authentication:', apiError);
        
        // Validate credentials locally
        const user = await this.validateCredentials(credentials.identifier, credentials.password);
        if (!user) {
          await this.handleFailedLogin(credentials.identifier, ipAddress);
          throw new Error('Invalid email or password');
        }

        // Check if account is locked
        if (user.security.lockedUntil && new Date() < user.security.lockedUntil) {
          throw new Error('Account is temporarily locked due to multiple failed attempts. Please try again later.');
        }

        // Check if account is verified
        if (!user.isVerified) {
          // Generate and send new OTP for verification
          const otp = CryptoService.generateOTP();
          await this.storeOTP(credentials.identifier, otp);
          
          if (credentials.identifier.includes('@')) {
            // For demo, store in localStorage to display in UI
            localStorage.setItem(`otp_${credentials.identifier}`, JSON.stringify({
              code: otp,
              timestamp: Date.now(),
              attempts: 0
            }));
          } else {
            // Send SMS with OTP - this would call the API in production
            console.log(`[DEMO] SMS OTP for ${credentials.identifier}: ${otp}`);
          }
          
          throw new Error('Account not verified. A new verification code has been sent to your email/phone.');
        }

        // Check MFA requirement
        if (user.security.mfaEnabled && !credentials.mfaCode) {
          return {
            success: false,
            requiresMFA: true,
            message: 'MFA code required'
          };
        }

        // Verify MFA if provided
        if (user.security.mfaEnabled && credentials.mfaCode) {
          const mfaValid = await this.verifyMFA(user.id, credentials.mfaCode);
          if (!mfaValid) {
            throw new Error('Invalid MFA code');
          }
        }

        // Check device trust
        const isTrustedDevice = this.isDeviceTrusted(user, deviceFingerprint);
        if (!isTrustedDevice && !credentials.rememberDevice) {
          // Could implement additional verification here
        }

        // Generate tokens
        const tokens = await JWTService.generateTokens(user);
        
        // Create session
        const sessionId = await this.createSession(user.id, deviceFingerprint, ipAddress);

        // Update user login info
        await this.updateLastLogin(user.id, ipAddress);

        // Add device to trusted list if requested
        if (credentials.rememberDevice && !isTrustedDevice) {
          await this.addTrustedDevice(user.id, deviceFingerprint, ipAddress);
        }

        // Store tokens securely
        await this.storeTokensSecurely(tokens);
        await this.storeUserData(user);

        // Success audit log
        await AuditService.log({
          action: 'login_success',
          resource: 'auth',
          details: { userId: user.id, sessionId },
          ipAddress,
          success: true
        });

        return {
          success: true,
          user,
          tokens,
          message: 'Login successful'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      await AuditService.log({
        action: 'login_failed',
        resource: 'auth',
        details: { identifier: credentials.identifier, error: errorMessage },
        ipAddress: await this.getClientIP(),
        success: false
      });

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async register(signupData: SignupData): Promise<{ 
    success: boolean; 
    user?: User; 
    message: string 
  }> {
    try {
      // Rate limiting
      const rateLimitCheck = await RateLimitService.checkLimit('register', signupData.identifier);
      if (!rateLimitCheck.allowed) {
        throw new Error('Too many registration attempts. Please try again later.');
      }

      // Validate input
      if (!this.validateSignupData(signupData)) {
        throw new Error('Invalid registration data');
      }

      try {
        // Try API endpoint first
        const response = await fetch(`${this.API_BASE}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(signupData)
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            return result;
          } else {
            throw new Error(result.message || 'Registration failed');
          }
        }
        
        // If API call fails, fall back to local registration
        throw new Error('API unavailable, using local registration');
      } catch (apiError) {
        console.warn('API registration failed, using local registration:', apiError);
        
        // Check if user already exists
        const existingUser = await this.findUserByIdentifier(signupData.identifier);
        if (existingUser) {
          throw new Error('An account with this email/phone already exists');
        }

        // Hash password
        const hashedPassword = await CryptoService.hashPassword(signupData.password);

        // Create user
        const user: User = {
          id: this.generateUserId(),
          email: signupData.identifier.includes('@') ? signupData.identifier : undefined,
          phoneNumber: !signupData.identifier.includes('@') ? signupData.identifier : undefined,
          isVerified: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: UserRole.USER,
          permissions: this.getDefaultPermissions(UserRole.USER),
          profile: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            company: signupData.company,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
          },
          security: {
            mfaEnabled: false,
            trustedDevices: [],
            lastPasswordChange: new Date(),
            failedLoginAttempts: 0,
            sessionTimeout: 480 // 8 hours
          }
        };

        // Store user (in production, this would be a database call)
        await this.storeUser(user, hashedPassword);

        // Generate and send OTP
        const otp = CryptoService.generateOTP();
        await this.storeOTP(signupData.identifier, otp);
        
        // Send OTP via SMS or email
        if (signupData.identifier.includes('@')) {
          // For demo, store in localStorage to display in UI
          localStorage.setItem(`otp_${signupData.identifier}`, JSON.stringify({
            code: otp,
            timestamp: Date.now(),
            attempts: 0
          }));
          console.log(`Email OTP for ${signupData.identifier}: ${otp}`);
        } else {
          // Send SMS OTP - this would call the API in production
          console.log(`[DEMO] SMS OTP for ${signupData.identifier}: ${otp}`);
        }

        // Audit log
        await AuditService.log({
          action: 'user_registered',
          resource: 'user',
          details: { userId: user.id, identifier: signupData.identifier },
          ipAddress: await this.getClientIP(),
          success: true
        });

        return {
          success: true,
          user,
          message: 'Registration successful. Please verify your account with the code sent to your email/phone.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  static async sendOTP(identifier: string, type: 'email' | 'phone'): Promise<{ success: boolean; message: string }> {
    try {
      // Rate limiting check
      const rateLimitCheck = await RateLimitService.checkLimit('otp', identifier);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many OTP requests. Try again in ${rateLimitCheck.resetTime} seconds.`);
      }

      try {
        // Try API endpoint first
        const response = await fetch(`${this.API_BASE}/api/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ identifier, type })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
        
        // If API call fails, fall back to local OTP generation
        throw new Error('API unavailable, using local OTP generation');
      } catch (apiError) {
        console.warn('API OTP sending failed, using local OTP generation:', apiError);
        
        // Generate OTP
        const otp = CryptoService.generateOTP();
        
        // Store OTP
        await this.storeOTP(identifier, otp);
        
        // For demo, store in localStorage to display in UI
        localStorage.setItem(`otp_${identifier}`, JSON.stringify({
          code: otp,
          timestamp: Date.now(),
          attempts: 0
        }));
        
        console.log(`[DEMO] OTP for ${identifier}: ${otp}`);
        
        // Log OTP generation
        await AuditService.log({
          action: 'otp_generated',
          resource: 'auth',
          details: { identifier, type },
          ipAddress: await this.getClientIP(),
          success: true
        });

        return {
          success: true,
          message: `Verification code sent to your ${type === 'email' ? 'email' : 'phone'}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send verification code'
      };
    }
  }

  static async verifyOTP(identifier: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      try {
        // Try API endpoint first
        const response = await fetch(`${this.API_BASE}/api/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ identifier, otp })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Update user verification status
            const user = await this.findUserByIdentifier(identifier);
            if (user) {
              user.isVerified = true;
              await this.updateUser(user);
            }
          }
          
          return result;
        }
        
        // If API call fails, fall back to local OTP verification
        throw new Error('API unavailable, using local OTP verification');
      } catch (apiError) {
        console.warn('API OTP verification failed, using local verification:', apiError);
        
        const storedData = localStorage.getItem(`otp_${identifier}`);
        
        if (!storedData) {
          return {
            success: false,
            message: 'Verification code expired or not found. Please request a new one.'
          };
        }

        const { code, timestamp, attempts } = JSON.parse(storedData);
        
        // Check if OTP is expired (5 minutes)
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem(`otp_${identifier}`);
          return {
            success: false,
            message: 'Verification code has expired. Please request a new one.'
          };
        }

        // Check attempts limit
        if (attempts >= 3) {
          localStorage.removeItem(`otp_${identifier}`);
          return {
            success: false,
            message: 'Too many failed attempts. Please request a new verification code.'
          };
        }

        // Verify OTP
        if (otp !== code) {
          // Increment attempts
          localStorage.setItem(`otp_${identifier}`, JSON.stringify({
            code,
            timestamp,
            attempts: attempts + 1
          }));
          
          return {
            success: false,
            message: `Invalid verification code. ${2 - attempts} attempts remaining.`
          };
        }

        // OTP verified successfully
        localStorage.removeItem(`otp_${identifier}`);
        
        // Update user verification status
        const user = await this.findUserByIdentifier(identifier);
        if (user) {
          user.isVerified = true;
          await this.updateUser(user);
        }

        // Log verification
        await AuditService.log({
          action: 'otp_verified',
          resource: 'auth',
          details: { identifier },
          ipAddress: await this.getClientIP(),
          success: true
        });

        return {
          success: true,
          message: 'Verification successful'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  static async refreshToken(): Promise<{ success: boolean; tokens?: AuthTokens; message: string }> {
    try {
      const currentTokens = await this.getStoredTokens();
      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        // Try API endpoint first
        const response = await fetch(`${this.API_BASE}/api/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentTokens.refreshToken}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.tokens) {
            // Store new tokens
            await this.storeTokensSecurely(result.tokens);
            return result;
          } else {
            throw new Error(result.message || 'Token refresh failed');
          }
        }
        
        // If API call fails, fall back to local token refresh
        throw new Error('API unavailable, using local token refresh');
      } catch (apiError) {
        console.warn('API token refresh failed, using local refresh:', apiError);
        
        // Verify refresh token
        const payload = await JWTService.verifyToken(currentTokens.refreshToken, 'refresh');
        if (!payload) {
          throw new Error('Invalid refresh token');
        }

        // Get user
        const user = await this.findUserById(payload.userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Generate new tokens
        const newTokens = await JWTService.generateTokens(user);
        
        // Store new tokens
        await this.storeTokensSecurely(newTokens);

        return {
          success: true,
          tokens: newTokens,
          message: 'Token refreshed successfully'
        };
      }
    } catch (error) {
      await this.logout(); // Clear invalid tokens
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens();
      const user = await this.getStoredUser();

      if (tokens && user) {
        try {
          // Try API endpoint first
          await fetch(`${this.API_BASE}/api/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.accessToken}`
            }
          });
        } catch (apiError) {
          console.warn('API logout failed, using local logout:', apiError);
        }

        // Invalidate session
        await this.invalidateSession(user.id);

        // Audit log
        await AuditService.log({
          action: 'logout',
          resource: 'auth',
          details: { userId: user.id },
          ipAddress: await this.getClientIP(),
          success: true
        });
      }

      // Clear stored data
      await this.clearStoredData();

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server call fails
      await this.clearStoredData();
    }
  }

  // Security Methods
  static async validateSession(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) return false;

      const payload = await JWTService.verifyToken(tokens.accessToken, 'access');
      if (!payload) {
        // Try to refresh token
        const refreshResult = await this.refreshToken();
        return refreshResult.success;
      }

      // Check if session is still valid
      const sessionValid = await this.isSessionValid(payload.userId, payload.sessionId);
      return sessionValid;

    } catch (error) {
      return false;
    }
  }

  // Private Helper Methods
  private static async validateCredentials(identifier: string, password: string): Promise<User | null> {
    // In production, this would query your database
    const userData = localStorage.getItem(`user_${identifier}`);
    if (!userData) return null;

    const { user, hashedPassword } = JSON.parse(userData);
    const isValid = await CryptoService.verifyPassword(password, hashedPassword);
    
    return isValid ? user : null;
  }

  private static async handleFailedLogin(identifier: string, ipAddress: string): Promise<void> {
    // Increment failed attempts
    const user = await this.findUserByIdentifier(identifier);
    if (user) {
      user.security.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.security.failedLoginAttempts >= 5) {
        user.security.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await this.updateUser(user);
    }

    // Log security event
    await SecurityService.logSecurityEvent({
      type: 'login_attempt',
      details: { identifier, failedAttempts: user?.security.failedLoginAttempts || 1 },
      ipAddress,
      severity: user?.security.failedLoginAttempts >= 3 ? 'warning' : 'info'
    });
  }

  private static isDeviceTrusted(user: User, deviceFingerprint: string): boolean {
    return user.security.trustedDevices.some(device => 
      device.deviceFingerprint === deviceFingerprint
    );
  }

  private static async addTrustedDevice(userId: string, deviceFingerprint: string, ipAddress: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) return;

    const trustedDevice: TrustedDevice = {
      id: this.generateId(),
      deviceFingerprint,
      deviceName: this.getDeviceName(),
      lastUsed: new Date(),
      ipAddress,
      userAgent: navigator.userAgent
    };

    user.security.trustedDevices.push(trustedDevice);
    await this.updateUser(user);
  }

  private static async createSession(userId: string, deviceFingerprint: string, ipAddress: string): Promise<string> {
    const sessionId = this.generateId();
    const sessionData = {
      id: sessionId,
      userId,
      deviceFingerprint,
      ipAddress,
      userAgent: navigator.userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      isActive: true
    };

    localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
    return sessionId;
  }

  private static async isSessionValid(userId: string, sessionId: string): Promise<boolean> {
    const sessionData = localStorage.getItem(`session_${sessionId}`);
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    return session.isActive && 
           session.userId === userId && 
           new Date() < new Date(session.expiresAt);
  }

  private static async invalidateSession(userId: string): Promise<void> {
    // In production, this would invalidate all sessions for the user
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('session_')) {
        const sessionData = localStorage.getItem(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.userId === userId) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }

  private static validateSignupData(data: SignupData): boolean {
    if (!data.identifier || !data.password || !data.acceptTerms) return false;
    if (data.password !== data.confirmPassword) return false;
    if (data.password.length < 8) return false;
    
    // Email validation
    if (data.identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data.identifier);
    }
    
    // Phone validation (basic)
    return data.identifier.length >= 10;
  }

  private static generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getDeviceName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Unknown Browser';
  }

  private static async getClientIP(): Promise<string> {
    try {
      // In production, this would be handled by your backend
      return '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  }

  // OTP Methods
  private static async storeOTP(identifier: string, otp: string): Promise<void> {
    localStorage.setItem(`otp_${identifier}`, JSON.stringify({
      code: otp,
      timestamp: Date.now(),
      attempts: 0
    }));
  }

  // Storage Methods
  private static async storeTokensSecurely(tokens: AuthTokens): Promise<void> {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  }

  private static async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!tokenData) return null;
      return JSON.parse(tokenData);
    } catch {
      return null;
    }
  }

  private static async storeUserData(user: User): Promise<void> {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  private static async getStoredUser(): Promise<User | null> {
    try {
      const userData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  private static async clearStoredData(): Promise<void> {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  // MFA Methods
  private static async verifyMFA(userId: string, code: string): Promise<boolean> {
    try {
      const secret = await this.getMFASecret(userId);
      if (!secret) return false;

      return CryptoService.verifyTOTP(code, secret);
    } catch (error) {
      return false;
    }
  }

  private static async getMFASecret(userId: string): Promise<string | null> {
    try {
      const encryptedSecret = localStorage.getItem(`mfa_${userId}`);
      if (!encryptedSecret) return null;
      return await CryptoService.decrypt(encryptedSecret);
    } catch {
      return null;
    }
  }

  // Public methods for admin functionality
  static async findUserByIdentifier(identifier: string): Promise<User | null> {
    const userData = localStorage.getItem(`user_${identifier}`);
    return userData ? JSON.parse(userData).user : null;
  }

  static async findUserById(id: string): Promise<User | null> {
    // For demo, search through all stored users
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          const { user } = JSON.parse(userData);
          if (user.id === id) {
            return user;
          }
        }
      }
    }
    return null;
  }

  static async storeUser(user: User, hashedPassword: string): Promise<void> {
    const identifier = user.email || user.phoneNumber;
    if (identifier) {
      localStorage.setItem(`user_${identifier}`, JSON.stringify({ user, hashedPassword }));
    }
  }

  static async updateUser(user: User): Promise<void> {
    const identifier = user.email || user.phoneNumber;
    if (identifier) {
      const existing = localStorage.getItem(`user_${identifier}`);
      if (existing) {
        const { hashedPassword } = JSON.parse(existing);
        localStorage.setItem(`user_${identifier}`, JSON.stringify({ user, hashedPassword }));
      }
    }
  }

  static async getAllUsers(): Promise<User[]> {
    const users: User[] = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          try {
            const { user } = JSON.parse(userData);
            users.push(user);
          } catch (error) {
            console.error(`Error parsing user data for ${key}:`, error);
          }
        }
      }
    }
    
    return users;
  }

  static async updateLastLogin(userId: string, ipAddress: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (user) {
      user.lastLogin = new Date();
      user.security.failedLoginAttempts = 0; // Reset on successful login
      await this.updateUser(user);
    }
  }

  static getDefaultPermissions(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.ADMIN:
        return Object.values(Permission);
      case UserRole.USER:
        return [
          Permission.READ_DATA,
          Permission.WRITE_DATA,
          Permission.EXPORT_DATA,
          Permission.IMPORT_DATA,
          Permission.VIEW_ANALYTICS,
          Permission.CREATE_REPORTS,
          Permission.USE_AI_FEATURES,
          Permission.CREATE_FORMULAS,
          Permission.MANAGE_WORKBOOKS
        ];
      case UserRole.VIEWER:
        return [
          Permission.READ_DATA,
          Permission.VIEW_ANALYTICS
        ];
      default:
        return [];
    }
  }
}