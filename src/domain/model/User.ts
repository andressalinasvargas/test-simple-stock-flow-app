export interface User {
  username: string;
  role: 'admin' | 'seller';
  accessToken: string;
  expiresAt: string;
}

