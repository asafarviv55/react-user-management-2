import apiService from './api';
import { User, TwoFactorAuth } from '../types/user';

interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post('/auth/login', credentials);

    if (response.data.token) {
      apiService.setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiService.post('/auth/signup', data);

    if (response.data.token) {
      apiService.setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      apiService.clearToken();
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiService.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async enable2FA(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const response = await apiService.post('/auth/2fa/enable');
    return response.data;
  }

  async verify2FA(code: string): Promise<{ verified: boolean }> {
    const response = await apiService.post('/auth/2fa/verify', { code });
    return response.data;
  }

  async disable2FA(code: string): Promise<void> {
    await apiService.post('/auth/2fa/disable', { code });
  }

  async get2FAStatus(): Promise<TwoFactorAuth> {
    const response = await apiService.get('/auth/2fa/status');
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/auth/password-reset/request', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/password-reset/confirm', { token, newPassword });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
export default authService;
