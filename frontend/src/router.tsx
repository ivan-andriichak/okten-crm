import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, logout } from './store';
import Login from './components/Login/Login';
import Orders from './components/Orders/Orders';
import { MainLayout } from './layouts';
import { ErrorPage } from './pages';
import HomePage from './pages/HomePage';

// Компонент для захищеного маршруту /orders
const ProtectedOrdersRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role, currentUserId } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return token && role ? (
    <Orders
      token={token}
      role={role}
      onLogout={handleLogout}
      currentUserId={currentUserId || ''}
    />
  ) : (
    <Navigate to="/login" replace />
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <Login /> },
      { path: '/orders', element: <ProtectedOrdersRoute /> },
    ],
  },
]);