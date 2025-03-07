// src/components/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, LoginRequest } from '../types/auth';

interface LoginProps {
  setTokenAndRole: (token: string, role: 'admin' | 'manager') => void;
}

const Login: React.FC<LoginProps> = ({ setTokenAndRole }) => {
  const [email, setEmail] = useState<string>('admin@gmail.com');
  const [password, setPassword] = useState<string>('admin');
  const [deviceId] = useState<string>('550e8400-e29b-41d4-a716-446655440000');
  const [role] = useState<'admin' | 'manager'>('admin');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<AuthResponse>('http://localhost:3001/login', {
        email,
        password,
        deviceId,
        role,
      } as LoginRequest);
      const { accessToken } = response.data.tokens;
      const userRole = response.data.user.role;
setTokenAndRole(accessToken, response.data.user.role);      console.log('Logged in successfully:', accessToken, 'Role:', userRole);
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.messages?.[0] || 'Login failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;