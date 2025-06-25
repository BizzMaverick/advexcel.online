import { Permission, UserRole } from '../types/auth';

// Define the permission matrix for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],
  
  [UserRole.USER]: [
    // Data permissions
    Permission.READ_DATA,
    Permission.WRITE_DATA,
    Permission.EXPORT_DATA,
    Permission.IMPORT_DATA,
    
    // Analytics permissions
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORTS,
    
    // Advanced features
    Permission.USE_AI_FEATURES,
    Permission.CREATE_FORMULAS,
    Permission.MANAGE_WORKBOOKS
  ],
  
  [UserRole.VIEWER]: [
    // Limited read-only permissions
    Permission.READ_DATA,
    Permission.VIEW_ANALYTICS
  ]
};

// Define permission descriptions for documentation
export const permissionDescriptions: Record<Permission, string> = {
  [Permission.READ_DATA]: 'View spreadsheet data and workbooks',
  [Permission.WRITE_DATA]: 'Edit and modify spreadsheet data',
  [Permission.DELETE_DATA]: 'Delete spreadsheet data and workbooks',
  [Permission.EXPORT_DATA]: 'Export data to various formats',
  [Permission.IMPORT_DATA]: 'Import data from external sources',
  
  [Permission.VIEW_ANALYTICS]: 'View analytics and reports',
  [Permission.CREATE_REPORTS]: 'Create and save custom reports',
  [Permission.SHARE_REPORTS]: 'Share reports with other users',
  
  [Permission.MANAGE_USERS]: 'Manage user accounts and permissions',
  [Permission.VIEW_AUDIT_LOGS]: 'View system audit logs',
  [Permission.MANAGE_SETTINGS]: 'Modify system settings',
  
  [Permission.USE_AI_FEATURES]: 'Use AI-powered features and insights',
  [Permission.CREATE_FORMULAS]: 'Create and modify formulas',
  [Permission.MANAGE_WORKBOOKS]: 'Create, edit, and organize workbooks'
};

// Define role descriptions
export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Full access to all system features and settings',
  [UserRole.USER]: 'Standard user with access to core features',
  [UserRole.VIEWER]: 'Read-only access to data and analytics'
};

// Check if a role has a specific permission
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role].includes(permission) || role === UserRole.ADMIN;
};

// Get all permissions for a role
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return rolePermissions[role];
};

// Get all roles that have a specific permission
export const getRolesWithPermission = (permission: Permission): UserRole[] => {
  return Object.entries(rolePermissions)
    .filter(([_, permissions]) => permissions.includes(permission))
    .map(([role]) => role as UserRole);
};

// Generate permission matrix for documentation
export const generatePermissionMatrix = (): Record<Permission, Record<UserRole, boolean>> => {
  const matrix: Record<Permission, Record<UserRole, boolean>> = {} as any;
  
  Object.values(Permission).forEach(permission => {
    matrix[permission] = {} as Record<UserRole, boolean>;
    
    Object.values(UserRole).forEach(role => {
      matrix[permission][role] = roleHasPermission(role, permission);
    });
  });
  
  return matrix;
};