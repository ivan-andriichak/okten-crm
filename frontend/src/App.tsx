// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<'admin' | 'manager' | null>(null);

  const handleSetTokenAndRole = (token: string, role: 'admin' | 'manager') => {
    setToken(token);
    setUserRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role); // Зберігаємо роль
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
          element={token ? <Navigate to="/orders" /> : <Login setTokenAndRole={handleSetTokenAndRole} />}
        />
        <Route
          path="/orders"
          element={
            token ? (
              <div>
                <h2>Orders Page</h2>
                <p>Token: {token}</p>
                <p>Role: {userRole}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
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