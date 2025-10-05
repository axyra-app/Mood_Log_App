import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // TEMPORAL: Desactivar autenticación para capturas
  return <>{children}</>;
};

export default ProtectedRoute;
