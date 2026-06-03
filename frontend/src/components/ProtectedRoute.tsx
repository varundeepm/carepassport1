import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, role }: { children: JSX.Element, role?: 'doctor' | 'patient' }) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && userType !== role) return <Navigate to="/dashboard" />;

  return children;
};

export default ProtectedRoute; 