import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import css from './Home.module.css';
import { Login } from '../Login';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/orders');
    }
  }, [token, navigate]);

  return (
    <div className={css.login_container}>
      <p style={{ textAlign: 'center' }}>Please log in to continue.</p>
      <div>
        <Login />
      </div>
    </div>
  );
};

export default Home;
