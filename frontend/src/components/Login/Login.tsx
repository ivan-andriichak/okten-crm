import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, login, RootState } from '../../store';
import Button from '../Button/Button';
import css from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState<string>('admin@gmail.com');
  const [password, setPassword] = useState<string>('admin');
  // const [deviceId, setDeviceId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // useEffect(() => {
  //   let storedDeviceId = localStorage.getItem('deviceId');
  //   if (!storedDeviceId) {
  //     storedDeviceId = uuidv4();
  //     localStorage.setItem('deviceId', storedDeviceId);
  //   }
  //   setDeviceId(storedDeviceId);
  // }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      login({
        email,
        password,
        deviceId: localStorage.getItem('deviceId') || undefined,
      }),
    );

    if (login.fulfilled.match(result)) {
      navigate('/orders');
    }
  };

  return (
    <div className={css.login}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            className={css.input}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
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
          <label htmlFor="showPassword">Show password</label>
        </div>
        <div>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { Login };