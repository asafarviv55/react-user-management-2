import { useState, useEffect, useCallback } from 'react';
import { Permission, PermissionAction } from '../types/user';
import permissionService from '../services/permissionService';

export const usePermissions = (userId: string | undefined) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPermissions();
    }
  }, [userId]);

  const loadPermissions = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await permissionService.getUserPermissions(userId);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const can = useCallback(
    (resource: string, action: PermissionAction): boolean => {
      return permissionService.canAccess(permissions, resource, action);
    },
    [permissions]
  );

  const canAny = useCallback(
    (requiredPermissions: Array<{ resource: string; action: PermissionAction }>): boolean => {
      return permissionService.hasAnyPermission(permissions, requiredPermissions);
    },
    [permissions]
  );

  const canAll = useCallback(
    (requiredPermissions: Array<{ resource: string; action: PermissionAction }>): boolean => {
      return permissionService.hasAllPermissions(permissions, requiredPermissions);
    },
    [permissions]
  );

  return {
    permissions,
    loading,
    can,
    canAny,
    canAll,
    refresh: loadPermissions,
  };
};
