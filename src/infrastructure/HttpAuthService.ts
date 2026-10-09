import { ApiClient } from './client';
import { User } from '../domain/model/User';

export class HttpAuthService {
  public static async login(username: string, password: string): Promise<User> {
    const data = await ApiClient.request<{
      accessToken: string;
      expiresAt: string;
      username: string;
      role: 'admin' | 'seller';
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    ApiClient.setAuth(data.accessToken, { username: data.username, role: data.role });
    return data;
  }

  public static async register(username: string, password: string): Promise<void> {
    await ApiClient.request<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  public static logout(): void {
    ApiClient.clearAuth();
  }
}

