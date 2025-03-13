import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { FC } from 'react';

const MainLayout: FC = () => {
  return (
    <ErrorBoundary>
      <div>
        <h1 style={{ textAlign : 'center' }}>CRM Dashboard</h1>
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};

export { MainLayout };
