import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteEditProfileProps {
  children: React.ReactNode;
}

const ProtectedRouteEditProfile: React.FC<ProtectedRouteEditProfileProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout para evitar carga infinita
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 segundos de timeout

    return () => clearTimeout(timer);
  }, []);

  // Si ha pasado el timeout, mostrar el contenido independientemente del loading
  if (timeoutReached) {
    if (!user) {
      return <Navigate to='/login' replace />;
    }

    // NO verificamos si necesita completar perfil aquí, ya que esta página es para editar el perfil
    return <>{children}</>;
  }

  // Mostrar loading solo si no ha pasado el timeout
  if (loading && !timeoutReached) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white text-lg font-semibold'>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario y no está cargando, redirigir al login
  if (!user) {
    return <Navigate to='/login' replace />;
  }

  // Mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRouteEditProfile;
