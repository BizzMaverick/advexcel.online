import { User, UserRole, Permission } from '../types/auth';
import { AuthService } from './authService';
import { CryptoService } from './cryptoService';
import { AuditService } from './auditService';

interface AdminServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class AdminService {
  /**
   * Get all users in the system
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      // In a real application, this would be an API call
      // For demo purposes, we'll get users from localStorage
      const users: User[] = [];
      
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);
      
      // Filter user data keys
      const userKeys = keys.filter(key => key.startsWith('user_'));
      
      // Extract user data
      for (const key of userKeys) {
        try {
          const userData = localStorage.getItem(key);
          if (userData) {
            const { user } = JSON.parse(userData);
            users.push(user);
          }
        } catch (error) {
          console.error(`Error parsing user data for key ${key}:`, error);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }
  
  /**
   * Add a new user to the system
   */
  static async addUser(userData: Partial<User>, password: string): Promise<AdminServiceResult> {
    try {
      // Validate required fields
      if ((!userData.email && !userData.phoneNumber) || !password) {
        return {
          success: false,
          message: 'Email/phone and password are required'
        };
      }
      
      // Check if user already exists
      const identifier = userData.email || userData.phoneNumber;
      if (!identifier) {
        return {
          success: false,
          message: 'Email or phone number is required'
        };
      }
      
      const existingUser = await AuthService.findUserByIdentifier(identifier);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email/phone already exists'
        };
      }
      
      // Hash password
      const hashedPassword = await CryptoService.hashPassword(password);
      
      // Create user object
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        isVerified: true, // Admin-created users are automatically verified
        createdAt: new Date(),
        lastLogin: new Date(),
        role: userData.role || UserRole.USER,
        permissions: AuthService.getDefaultPermissions(userData.role || UserRole.USER),
        profile: userData.profile || {
          firstName: '',
          lastName: '',
          company: ''
        },
        security: {
          mfaEnabled: false,
          trustedDevices: [],
          lastPasswordChange: new Date(),
          failedLoginAttempts: 0,
          sessionTimeout: 480 // 8 hours
        }
      };
      
      // Store user
      await AuthService.storeUser(newUser, hashedPassword);
      
      // Log the action
      await AuditService.log({
        action: 'user_created_by_admin',
        resource: 'user',
        details: { userId: newUser.id, role: newUser.role },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return {
        success: true,
        message: 'User created successfully',
        data: newUser
      };
    } catch (error) {
      console.error('Error adding user:', error);
      return {
        success: false,
        message: 'Failed to add user'
      };
    }
  }
  
  /**
   * Update an existing user
   */
  static async updateUser(userData: User): Promise<AdminServiceResult> {
    try {
      // Find the user
      const existingUser = await AuthService.findUserById(userData.id);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      // Update user data
      const updatedUser: User = {
        ...existingUser,
        role: userData.role,
        isVerified: userData.isVerified,
        profile: userData.profile,
        security: userData.security
      };
      
      // Store updated user
      await AuthService.updateUser(updatedUser);
      
      // Log the action
      await AuditService.log({
        action: 'user_updated_by_admin',
        resource: 'user',
        details: { userId: updatedUser.id, role: updatedUser.role },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Failed to update user'
      };
    }
  }
  
  /**
   * Delete a user from the system
   */
  static async deleteUser(userId: string): Promise<AdminServiceResult> {
    try {
      // Find the user
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      // Delete user data
      const identifier = user.email || user.phoneNumber;
      if (!identifier) {
        return {
          success: false,
          message: 'User has no identifier'
        };
      }
      
      localStorage.removeItem(`user_${identifier}`);
      
      // Log the action
      await AuditService.log({
        action: 'user_deleted_by_admin',
        resource: 'user',
        details: { userId, email: user.email, phoneNumber: user.phoneNumber },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user'
      };
    }
  }
  
  /**
   * Reset a user's password
   */
  static async resetUserPassword(userId: string, newPassword: string): Promise<AdminServiceResult> {
    try {
      // Find the user
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      // Validate password
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters'
        };
      }
      
      // Hash new password
      const hashedPassword = await CryptoService.hashPassword(newPassword);
      
      // Update user's password
      const identifier = user.email || user.phoneNumber;
      if (!identifier) {
        return {
          success: false,
          message: 'User has no identifier'
        };
      }
      
      // Update user security info
      const updatedUser: User = {
        ...user,
        security: {
          ...user.security,
          lastPasswordChange: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: undefined
        }
      };
      
      // Store updated user with new password
      await AuthService.storeUser(updatedUser, hashedPassword);
      
      // Log the action
      await AuditService.log({
        action: 'password_reset_by_admin',
        resource: 'user',
        details: { userId, email: user.email, phoneNumber: user.phoneNumber },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }
  
  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    lockedUsers: number;
    adminUsers: number;
    recentLogins: number;
  }> {
    try {
      const users = await this.getAllUsers();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isVerified).length,
        pendingUsers: users.filter(user => !user.isVerified).length,
        lockedUsers: users.filter(user => 
          user.security?.lockedUntil && new Date(user.security.lockedUntil) > now
        ).length,
        adminUsers: users.filter(user => user.role === UserRole.ADMIN).length,
        recentLogins: users.filter(user => 
          new Date(user.lastLogin) > oneDayAgo
        ).length
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw new Error('Failed to retrieve system statistics');
    }
  }
}