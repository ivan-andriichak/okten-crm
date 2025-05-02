import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, login } from '../../store';
import { api } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import Button from '../Button/Button';
import css from './SetPassword.module.css';

const SetPassword: FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [_email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isActivation = location.pathname.includes('/activate');
  const title = isActivation ? 'Activate Account' : 'Recover Password';

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (!token) {
        throw new Error('Invalid or missing token');
      }
      const response = await api.get(`/admin/user-by-token/${token}`);
      const userEmail = response.data.email;
      setEmail(userEmail);

      await api.post(`/admin/set-password/${token}`, { password });

      // Автоматичний логін
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('deviceId', deviceId);
      }
      const result = await dispatch(
        login({
          email: userEmail,
          password,
          deviceId,
        }),
      );

      if (login.fulfilled.match(result)) {
        setSuccess('Password set successfully! Redirecting to orders...');
        setError(null);
        setPassword('');
        setConfirmPassword('');
      } else {
        throw new Error('Login failed after setting password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to set password');
      setSuccess(null);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className={css.recoverPassword}>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>
        <div className={css.checkboxContainer}>
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="showPassword">Show Password</label>
        </div>
        {error && <p className={css.error}>{error}</p>}
        {success && <p className={css.success}>{success}</p>}
        <div>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SetPassword;