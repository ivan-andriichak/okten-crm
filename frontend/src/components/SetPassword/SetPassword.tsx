import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, login } from '../../store';

import { api } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import Button from '../Button/Button';
import css from './SetPassword.module.css';
import { addNotification } from '../../store/slices/notificationSlice';

const SetPassword: FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [_email, setEmail] = useState('');

  const isActivation = location.pathname.includes('/activate');
  const title = isActivation ? 'Activate Account' : 'Recover Password';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (_email) {
        navigate('/orders');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [_email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      dispatch(
        addNotification({
          message: 'Password must be at least 8 characters long',
          type: 'error',
          duration: 5000,
        }),
      );
      return;
    }

    if (password !== confirmPassword) {
      dispatch(
        addNotification({
          message: 'Passwords do not match',
          type: 'error',
          duration: 5000,
        }),
      );
      return;
    }

    if (!token) {
      dispatch(
        addNotification({
          message: 'Invalid or missing token',
          type: 'error',
          duration: 5000,
        }),
      );
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      // Отримання email користувача
      const response = await api.get(`/admin/user-by-token/${token}`);
      const userEmail = response.data.email;
      setEmail(userEmail);

      // Встановлення пароля
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
        dispatch(
          addNotification({
            message: 'Password set successfully! Redirecting to orders...',
            type: 'success',
            duration: 5000,
          }),
        );
        setPassword('');
        setConfirmPassword('');
      } else {
        throw new Error('Login failed after setting password');
      }
    } catch (err: any) {
      dispatch(
        addNotification({
          message:
            err.response?.data?.message ||
            err.message ||
            'Failed to set password',
          type: 'error',
          duration: 5000,
        }),
      );
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
            className={css.input}
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
            className={css.input}
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
