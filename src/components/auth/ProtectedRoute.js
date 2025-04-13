// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../common/Loader';

const ProtectedRoute = ({ children, isAdmin }) => {
  const { currentUser, loading, isAdmin: hasAdminRights } = useAuth();
  
  if (loading) {
    return <Loader size="large" text="Проверка авторизации..." />;
  }
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" />;
  }
  
  if (isAdmin && !hasAdminRights) {
    // Redirect to home if not admin
    return <Navigate to="/" />;
  }
  
  return children;
};

export default ProtectedRoute;