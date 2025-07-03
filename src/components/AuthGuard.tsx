import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Permission, UserRole } from '../types/auth';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  const trialDaysRemaining = typeof user?.trialExpiresAt === 'string' ? (() => {
    const expires = new Date(user.trialExpiresAt!);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  })() : null;

  useEffect(() => {
    if (redirectTo && !isAuthenticated && !isLoading) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  // Show loading state
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

  // Check authentication
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
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
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Role</h2>
          <p className="text-gray-600 mb-4">
            You need the <span className="font-semibold">{requiredRole}</span> role to access this page.
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
  if (requiredPermissions.length > 0) {
    const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
    
    if (missingPermissions.length > 0) {
      if (fallback) {
        return <>{fallback}</>;
      }

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

  // Check trial period
  if (user && user.trialExpiresAt && trialDaysRemaining === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Trial Expired</h2>
          <p className="text-gray-600 mb-6">
            Your 10-day free trial has expired. Please subscribe to continue using the service.
          </p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};