export class ApiClient {
  private static get token(): string | null {
    return localStorage.getItem('ssf_token');
  }

  public static setAuth(token: string, user: { username: string; role: 'admin' | 'seller' }): void {
    localStorage.setItem('ssf_token', token);
    localStorage.setItem('ssf_user', JSON.stringify(user));
  }

  public static clearAuth(): void {
    localStorage.removeItem('ssf_token');
    localStorage.removeItem('ssf_user');
  }

  public static getStoredUser(): { username: string; role: 'admin' | 'seller' } | null {
    const raw = localStorage.getItem('ssf_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearAuth();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Sesión expirada o no autorizada.');
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {
        const errJson = await response.json();
        throw new Error(errJson.detail || errJson.title || errJson.message || 'Error en la solicitud.');
      }
      throw new Error(`Error HTTP ${response.status}`);
    }

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  }
}

