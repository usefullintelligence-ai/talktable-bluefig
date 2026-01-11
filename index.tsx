
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import WaiterDashboard from './WaiterDashboard';
import Login from './Login';

// Fixed: Made children optional in the type definition to resolve the TypeScript error on line 25 
// where property 'children' was reported as missing in the component usage.
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
