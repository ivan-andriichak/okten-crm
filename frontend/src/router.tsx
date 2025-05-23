import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, logout, RootState } from './store';
import { MainLayout } from './layouts';
import { ErrorPage, HomePage } from './pages';
import { Orders } from './components/Orders';
import { PublicOrderForm } from './components/PublicOrderForm';
import { Login } from './components/Login';
import AdminPanel from './components/AdminPanel/AdminPanel';
import SetPassword from './components/SetPassword/SetPassword';

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

const ProtectedAdminRoute = () => {
  const { token, role } = useSelector((state: RootState) => state.auth);

  return token && role === 'admin' ? (
    <AdminPanel token={token} role={role} />
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
      { path: '/admin', element: <ProtectedAdminRoute /> },
      { path: '/activate/:token', element: <SetPassword /> },
      { path: '/recover/:token', element: <SetPassword /> },
      { path: '/set-password/:token', element: <SetPassword /> },
    ],
  },
  {
    path: '/register',
    element: <PublicOrderForm />,
    errorElement: <ErrorPage />,
  },
]);

export default router;
