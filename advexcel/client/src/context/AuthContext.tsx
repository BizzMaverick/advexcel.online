import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  subscription?: {
    type: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  clearError: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData: any) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);