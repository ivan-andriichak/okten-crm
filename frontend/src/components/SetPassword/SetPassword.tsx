import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addNotification,
  AppDispatch,
  clearNotifications,
  login,
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
  const [email, setEmail] = useState('');
  const [, setLoading] = useState(false);

  const isActivation = location.pathname.includes('/activate');
  const title = isActivation ? 'Activate Account' : 'Reset Password';

  useEffect(() => {
    dispatch(clearNotifications());

    // Fetch email by token
    const fetchEmail = async () => {
      if (!token) {
        dispatch(
          addNotification({
            message: 'Invalid or missing token',
            type: 'error',
            duration: 5000,
          }),
        );
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      try {
        const response = await api.get(`/admin/user-by-token/${token}`);
        setEmail(response.data.email);
      } catch (err: any) {
        dispatch(
          addNotification({
            message: 'Invalid or expired token',
            type: 'error',
            duration: 5000,
          }),
        );
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    void fetchEmail();
  }, [dispatch, token, navigate]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length > 128) {
      return 'Password cannot exceed 128 characters.';
    }
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(pwd)) {
      return (
        'Password must be at least 8 characters long and include uppercase,' +
        ' lowercase letters, numbers, and special characters (@$!%*?&).'
      );
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(clearNotifications());

    const passwordError = validatePassword(password);
    if (passwordError) {
      dispatch(
        addNotification({
          message: passwordError,
          type: 'error',
          duration: 5000,
        }),
      );
      setLoading(false);
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
      setLoading(false);
      return;
    }

    if (!token || !email) {
      dispatch(
        addNotification({
          message: 'Missing or invalid token or email',
          type: 'error',
          duration: 5000,
        }),
      );
      setTimeout(() => navigate('/login'), 3000);
      setLoading(false);
      return;
    }

    try {
      await api.post(`/admin/set-password/${token}`, { password });

      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('deviceId', deviceId);
      }

      const result = await dispatch(
        login({
          email,
          password,
          deviceId,
        }),
      );

      if (login.fulfilled.match(result)) {
        dispatch(
          addNotification({
            message: 'Password successfully set! Redirecting to orders...',
            type: 'success',
            duration: 5000,
          }),
        );
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          dispatch(clearNotifications());
          navigate('/orders', { replace: true });
        }, 5000);
      } else {
        throw new Error('Login failed after setting password');
      }
    } catch (err: any) {
      setLoading(false);
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
