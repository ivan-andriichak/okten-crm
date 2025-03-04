export interface AuthResponse {
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
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  role?: 'admin' | 'manager';
}