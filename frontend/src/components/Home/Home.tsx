import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from '../Login/Login';
import ErrorBoundary from '../ErrorBoundary';
import Orders from '../Orders/Orders';
import { RootState, AppDispatch, logout } from '../../store';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Routes>
      <Route
        path="/*"
        element={token ? <Navigate to="/orders" /> : <Login />}
      />
      <Route
        path="/orders"
        element={
          token && role ? (
            <ErrorBoundary>
              <Orders
                role={role as 'manager' | 'admin'}
                onLogout={handleLogout}
                token={''}
                currentUserId={''}
              />
            </ErrorBoundary>
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
};

export default Home;
