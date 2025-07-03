import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Permission } from '../types/auth';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  fallback
}) => {
  const { hasPermission } = useAuthContext();

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );

  if (!hasAllPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          You don't have permission to access this feature.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

interface PermissionButtonProps {
  children: React.ReactNode;
  requiredPermission: Permission;
  onClick: () => void;
  className?: string;
  disabledClassName?: string;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  children,
  requiredPermission,
  onClick,
  className = '',
  disabledClassName = 'opacity-50 cursor-not-allowed'
}) => {
  const { hasPermission } = useAuthContext();
  const hasAccess = hasPermission(requiredPermission);

  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess}
      className={`${className} ${!hasAccess ? disabledClassName : ''}`}
      title={!hasAccess ? `Requires ${requiredPermission} permission` : undefined}
    >
      {children}
    </button>
  );
};