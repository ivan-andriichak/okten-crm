import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import Button from '../Button/Button';
import css from './SetPassword.module.css';

const SetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isActivation = location.pathname.includes('/activate');
  const title = isActivation ? 'Activate Account' : 'Recover Password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await api.post(`/admin/set-password/${token}`, { password });
      setSuccess('Password set successfully!');
      setError(null);
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password');
      setSuccess(null);
    }
  };

  return (
    <div className={css.container}>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        {error && <p className={css.error}>{error}</p>}
        {success && <p className={css.success}>{success}</p>}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default SetPassword;