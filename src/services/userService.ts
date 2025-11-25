import apiService from './api';
import { User, UserAnalytics, UserPreferences, UserSession } from '../types/user';

export class UserService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const response = await apiService.get('/users', { params });
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await apiService.get(`/users/${id}`);
    return response.data;
  }

  async create(userData: Partial<User>): Promise<User> {
    const response = await apiService.post('/users', userData);
    return response.data;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiService.put(`/users/${id}`, userData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/users/${id}`);
  }

  async bulkDelete(userIds: string[]): Promise<void> {
    await apiService.post('/users/bulk-delete', { userIds });
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const response = await apiService.patch(`/users/${id}/status`, { status });
    return response.data;
  }

  async getAnalytics(): Promise<UserAnalytics> {
    const response = await apiService.get('/users/analytics');
    return response.data;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await apiService.get(`/users/${userId}/preferences`);
    return response.data;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiService.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const response = await apiService.get(`/users/${userId}/sessions`);
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await apiService.delete(`/sessions/${sessionId}`);
  }

  async uploadAvatar(userId: string, file: File): Promise<{ url: string }> {
    const response = await apiService.upload(`/users/${userId}/avatar`, file);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
