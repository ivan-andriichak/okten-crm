import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, logout, RootState } from './store';
import Login from './components/Login/Login';
import { MainLayout } from './layouts';
import { ErrorPage, HomePage } from './pages';
import { Orders } from './components/Orders';

const ProtectedOrdersRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role, currentUserId } = useSelector(
    (state: RootState) => state.auth,
  );

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

const router = createBrowserRouter([
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

export { router };