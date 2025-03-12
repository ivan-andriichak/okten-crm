export interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    surname: string;
    is_active: boolean;
    last_login: string;
    image: string | null;
    role: 'admin' | 'manager';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  role?: 'admin' | 'manager';
}