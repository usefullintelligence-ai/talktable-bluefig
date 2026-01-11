
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import WaiterDashboard from './WaiterDashboard';
import Login from './Login';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuth = localStorage.getItem('alreem_auth') === 'true';
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

const Root = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/waiter" 
          element={
            <ProtectedRoute>
              <WaiterDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
