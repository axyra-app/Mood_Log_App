import React from 'react';
import { useAuth } from '../contexts/AuthContext-debug';
import DashboardSimple from '../pages/DashboardSimple';
import DashboardPsychologist from '../pages/DashboardPsychologist';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Redirigir según el rol del usuario
  if (user.role === 'psychologist') {
    return <DashboardPsychologist />;
  }

  // Por defecto, mostrar dashboard de usuario
  return <DashboardSimple />;
};

export default RoleBasedDashboard;
