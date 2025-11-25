import apiService from './api';
import { Notification, NotificationType } from '../types/user';

export class NotificationService {
  async getAll(userId: string, params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const response = await apiService.get(`/users/${userId}/notifications`, { params });
    return response.data;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const response = await apiService.get(`/users/${userId}/notifications/unread-count`);
    return response.data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await apiService.post(`/users/${userId}/notifications/mark-all-read`);
  }

  async delete(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}`);
  }

  async deleteAll(userId: string): Promise<void> {
    await apiService.delete(`/users/${userId}/notifications`);
  }

  async create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const response = await apiService.post('/notifications', notification);
    return response.data;
  }

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    // WebSocket or SSE implementation
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/notifications/stream/${userId}`);

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      callback(notification);
    };

    eventSource.onerror = (error) => {
      console.error('Notification stream error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
