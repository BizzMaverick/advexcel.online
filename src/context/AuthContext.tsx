import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, AuthTokens, Permission, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  login: (credentials: any) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<any>;
  refreshTokens: () => Promise<boolean>;
  updateUser: (user: User) => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredPermissions?: Permission[];
    requiredRole?: UserRole;
    redirectTo?: string;
  } = {}
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuthContext();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !user) {
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
        return null;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    // Check role requirement
    if (options.requiredRole && !hasRole(options.requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Role</h2>
            <p className="text-gray-600 mb-4">
              You need the <span className="font-semibold">{options.requiredRole}</span> role to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your current role: <span className="font-semibold">{user.role}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const missingPermissions = options.requiredPermissions.filter(
        permission => !hasPermission(permission)
      );
      
      if (missingPermissions.length > 0) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-red-800 mb-2">Missing permissions:</p>
                <ul className="text-xs text-red-700 list-disc list-inside">
                  {missingPermissions.map(permission => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };

  return WithAuth;
};