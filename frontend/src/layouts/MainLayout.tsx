import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

export const MainLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <div>
        <h1>CRM Dashboard</h1>
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};
