import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { FC } from 'react';
import Notification from '../components/Notification/Notification';

const MainLayout: FC = () => {
  return (
    <ErrorBoundary>
      <div>
        <Notification />
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};

export { MainLayout };
