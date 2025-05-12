import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addNotification,
  AppDispatch,
  login,
  clearNotifications,
} from '../../store';
import Button from '../Button/Button';
import css from './SetPassword.module.css';
import { api } from '../../services/api';

const SetPassword: FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setEmail] = useState('');

  const isActivation = location.pathname.includes('/activate');
  const title = isActivation ? 'Activate Account' : 'Recover Password';

  useEffect(() => {
    // Очистити сповіщення при завантаженні компонента
    dispatch(clearNotifications());
    console.log('SetPassword mounted');
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      console.log('Dispatching error notification: Password is too short');
      const action = addNotification({
        message: 'Password must be at least 8 characters long',
        type: 'error',
        duration: 8000,
      });
      dispatch(action);
      console.log('Dispatched action:', action);
      return;
    }

    if (password !== confirmPassword) {
      console.log('Dispatching error notification: Passwords do not match');
      const action = addNotification({
        message: 'Passwords do not match',
        type: 'error',
        duration: 10000,
      });
      dispatch(action);
      console.log('Dispatched action:', action);
      return;
    }

    if (!token) {
      console.log('Dispatching error notification: Invalid or missing token');
      const action = addNotification({
        message: 'Invalid or missing token',
        type: 'error',
        duration: 8000,
      });
      dispatch(action);
      console.log('Dispatched action:', action);
      setTimeout(() => {
        navigate('/login');
      }, 8000);
      return;
    }

    // Очистити сповіщення перед асинхронним запитом
    dispatch(clearNotifications());

    try {
      const response = await api.get(`/admin/user-by-token/${token}`);
      const userEmail = response.data.email;
      setEmail(userEmail);

      // Встановлення пароля
      await api.post(`/admin/set-password/${token}`, { password });

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
        console.log('Dispatching success notification');
        const action = addNotification({
          message: 'Password set successfully! Redirecting to orders...',
          type: 'success',
          duration: 8000,
        });
        dispatch(action);
        console.log('Dispatched action:', action);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          console.log('Navigating to /orders');
          dispatch(clearNotifications()); // Очистити сповіщення перед редиректом
          navigate('/orders', { replace: true });
        }, 8000);
      } else {
        throw new Error('Login failed after setting password');
      }
    } catch (err: any) {
      console.log('Dispatching error notification: Failed to set password');
      const action = addNotification({
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to set password',
        type: 'error',
        duration: 8000,
      });
      dispatch(action);
      console.log('Dispatched action:', action);
      setTimeout(() => {
        navigate('/login');
      }, 8000);
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