import { useState, useEffect, useCallback } from 'react';
import { User, AuthTokens, AuthState, LoginCredentials, SignupData, UserRole, Permission } from '../types/auth';
import { AuthService } from '../utils/authService';
import { SecurityService } from '../utils/securityService';
import { AuditService } from '../utils/auditService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    sessionId: null
  });

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto-refresh tokens
  useEffect(() => {
    if (authState.tokens && authState.isAuthenticated) {
      const refreshInterval = setInterval(async () => {
        await refreshTokens();
      }, 14 * 60 * 1000); // Refresh every 14 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [authState.tokens, authState.isAuthenticated]);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Check if session is valid
      const isValid = await AuthService.validateSession();
      
      if (isValid) {
        const user = await getStoredUser();
        const tokens = await getStoredTokens();
        let trialExpired = false;
        let trialExpiresAt = null;
        if (user && user.trialExpiresAt) {
          trialExpiresAt = new Date(user.trialExpiresAt);
        } else {
          const trialExpiresAtStr = localStorage.getItem('trialExpiresAt');
          if (trialExpiresAtStr) trialExpiresAt = new Date(trialExpiresAtStr);
        }
        if (trialExpiresAt && trialExpiresAt < new Date()) {
          trialExpired = true;
        }
        if (user && tokens && !trialExpired) {
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionId: tokens.accessToken ? extractSessionId(tokens.accessToken) : null
          });
          return;
        }
      }

      // Clear invalid session
      await logout();
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize authentication'
      }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await AuthService.login(credentials);
      
      if (result.success && result.user && result.tokens) {
        setAuthState({
          user: result.user,
          tokens: result.tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionId: extractSessionId(result.tokens.accessToken)
        });

        return { success: true, user: result.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));

        return { success: false, message: result.message, requiresMFA: result.requiresMFA };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, message: errorMessage };
    }
  };

  const register = async (signupData: SignupData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await AuthService.register(signupData);
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));

        return { success: true, message: result.message };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));

        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await AuthService.logout();
      
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionId: null
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if logout fails
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionId: null
      });

      return { success: false, message: 'Logout failed' };
    }
  };

  const refreshTokens = async () => {
    try {
      const result = await AuthService.refreshToken();
      
      if (result.success && result.tokens) {
        setAuthState(prev => ({
          ...prev,
          tokens: result.tokens!,
          sessionId: extractSessionId(result.tokens!.accessToken)
        }));
        return true;
      } else {
        // Refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Helper functions
  const getStoredUser = async (): Promise<User | null> => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const getStoredTokens = async (): Promise<AuthTokens | null> => {
    try {
      const tokenData = localStorage.getItem('auth_tokens');
      return tokenData ? JSON.parse(tokenData) : null;
    } catch {
      return null;
    }
  };

  const extractSessionId = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sessionId || null;
    } catch {
      return null;
    }
  };

  // Helper: get days remaining in trial
  const getTrialDaysRemaining = (): number | null => {
    let trialExpiresAt = null;
    if (authState.user && authState.user.trialExpiresAt) {
      trialExpiresAt = new Date(authState.user.trialExpiresAt);
    } else {
      const trialExpiresAtStr = localStorage.getItem('trialExpiresAt');
      if (trialExpiresAtStr) trialExpiresAt = new Date(trialExpiresAtStr);
    }
    if (!trialExpiresAt) return null;
    const now = new Date();
    const diff = trialExpiresAt.getTime() - now.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  return {
    // State
    user: authState.user,
    tokens: authState.tokens,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    sessionId: authState.sessionId,

    // Actions
    login,
    register,
    logout,
    refreshTokens,
    updateUser,
    clearError,
    getTrialDaysRemaining,

    // Utilities
    hasPermission: (permission: string) => 
      authState.user?.permissions.includes(permission as any) || 
      authState.user?.role === UserRole.ADMIN || false,
    
    hasRole: (role: string) => 
      authState.user?.role === role,
    
    isAdmin: () => 
      authState.user?.role === UserRole.ADMIN
  };
};