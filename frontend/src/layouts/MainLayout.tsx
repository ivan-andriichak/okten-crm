import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { FC } from 'react';

const MainLayout: FC = () => {
  return (
    <ErrorBoundary>
      <div>
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};

export { MainLayout };
