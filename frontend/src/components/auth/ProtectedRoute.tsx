import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireRole = []
}) => {
  // For now, we'll just check if there's a token in localStorage
  // In a real app, you'd check the authentication state from your store
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // TODO: Add role-based access control
  // const userRole = getUserRole();
  // if (requireRole.length > 0 && !requireRole.includes(userRole)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
