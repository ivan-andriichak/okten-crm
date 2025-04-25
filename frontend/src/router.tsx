import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, logout, RootState } from './store';
import { MainLayout } from './layouts';
import { ErrorPage, HomePage } from './pages';
import { Orders } from './components/Orders';
import { PublicOrderForm } from './components/PublicOrderForm';
import { Login } from './components/Login';
import AdminPanel from './components/AdminPanel/AdminPanel';
// import { ActivateAccount } from './components/ActivateAccount/ActivateAccount'; // Буде додано пізніше

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
  const dispatch = useDispatch<AppDispatch>();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return token && role === 'admin' ? (
    <AdminPanel token={token} role={role} onLogout={handleLogout} />
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
    ],
  },
  {
    path: '/register',
    element: <PublicOrderForm />,
    errorElement: <ErrorPage />,
  },
  // {
  //   path: '/activate/:token',
  //   element: <ActivateAccount />,
  //   errorElement: <ErrorPage />,
  // }, // Буде додано пізніше
]);

export { router };