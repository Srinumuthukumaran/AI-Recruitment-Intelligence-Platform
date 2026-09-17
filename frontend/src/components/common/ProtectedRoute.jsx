import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If recruiter tries to access candidate route, redirect to recruiter dashboard
    if (user?.role === 'RECRUITER') {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    // If candidate tries to access recruiter route, redirect to candidate dashboard
    if (user?.role === 'CANDIDATE') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
