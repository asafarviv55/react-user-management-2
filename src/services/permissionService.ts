import apiService from './api';
import { Permission, PermissionAction } from '../types/user';

export class PermissionService {
  async getAll(): Promise<Permission[]> {
    const response = await apiService.get('/permissions');
    return response.data;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const response = await apiService.get(`/users/${userId}/permissions`);
    return response.data;
  }

  async getRolePermissions(role: string): Promise<Permission[]> {
    const response = await apiService.get(`/roles/${role}/permissions`);
    return response.data;
  }

  async assignPermission(userId: string, permissionId: string): Promise<void> {
    await apiService.post(`/users/${userId}/permissions`, { permissionId });
  }

  async revokePermission(userId: string, permissionId: string): Promise<void> {
    await apiService.delete(`/users/${userId}/permissions/${permissionId}`);
  }

  async checkPermission(userId: string, resource: string, action: PermissionAction): Promise<boolean> {
    const response = await apiService.post('/permissions/check', {
      userId,
      resource,
      action
    });
    return response.data.allowed;
  }

  async bulkAssignPermissions(userId: string, permissionIds: string[]): Promise<void> {
    await apiService.post(`/users/${userId}/permissions/bulk`, { permissionIds });
  }

  canAccess(permissions: Permission[], resource: string, action: PermissionAction): boolean {
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        (permission.action === action || permission.action === PermissionAction.EXECUTE)
    );
  }

  hasAnyPermission(permissions: Permission[], requiredPermissions: Array<{ resource: string; action: PermissionAction }>): boolean {
    return requiredPermissions.some(({ resource, action }) =>
      this.canAccess(permissions, resource, action)
    );
  }

  hasAllPermissions(permissions: Permission[], requiredPermissions: Array<{ resource: string; action: PermissionAction }>): boolean {
    return requiredPermissions.every(({ resource, action }) =>
      this.canAccess(permissions, resource, action)
    );
  }
}

export const permissionService = new PermissionService();
export default permissionService;
