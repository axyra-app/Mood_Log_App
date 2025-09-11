import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo verificar si no está cargando y hay un usuario
    if (!loading && user) {
      // Verificar si el usuario tiene un perfil completo
      const hasCompleteProfile = user.username && user.displayName && user.role;

      // Si no tiene perfil completo, redirigir a completar perfil
      if (!hasCompleteProfile) {
        console.log('Usuario necesita completar perfil, redirigiendo...');
        navigate('/complete-profile');
      }
    }
  }, [user, loading, navigate]);

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white text-lg font-semibold'>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (el ProtectedRoute se encargará)
  if (!user) {
    return null;
  }

  // Si el usuario tiene perfil completo, mostrar el contenido
  return <>{children}</>;
};

export default ProfileCompletionGuard;
