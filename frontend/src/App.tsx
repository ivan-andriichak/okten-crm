// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Orders from './components/Orders';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<'admin' | 'manager' | null>(
    localStorage.getItem('role') as 'admin' | 'manager' | null
  );

  const handleSetTokenAndRole = (token: string, role: 'admin' | 'manager') => {
    setToken(token);
    setUserRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/orders" />
            ) : (
              <Login setTokenAndRole={handleSetTokenAndRole} />
            )
          }
        />
        <Route
          path="/orders"
          element={
            token && userRole ? (
              <ErrorBoundary>
              <Orders
                token={token}
                role={userRole}
                onLogout={handleLogout}
                currentUserId={''}
              />
              </ErrorBoundary>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;