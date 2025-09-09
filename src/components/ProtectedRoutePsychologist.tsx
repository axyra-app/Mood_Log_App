import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRoutePsychologistProps {
  children: React.ReactNode;
}

const ProtectedRoutePsychologist: React.FC<ProtectedRoutePsychologistProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white text-lg font-semibold'>Verificando credenciales profesionales...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (user.role !== 'psychologist') {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoutePsychologist;
