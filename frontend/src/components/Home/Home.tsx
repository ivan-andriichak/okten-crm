import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import Login from '../Login/Login';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/orders'); // Редірект на /orders, якщо є токен
    }
  }, [token, navigate]);

  return (
    <div>
      <p>Please log in to continue.</p>
      <Login/>
    </div>
  );
};

export default Home;