import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

    // Verificar si necesita completar perfil
    const needsProfileCompletion = !user.displayName || !user.username || 
                                 user.displayName === user.email?.split('@')[0];
    
    if (needsProfileCompletion) {
      return <Navigate to='/complete-profile' replace />;
    }

    // Si es psicólogo, redirigir al dashboard de psicólogos
    if (user.role === 'psychologist') {
      return <Navigate to='/dashboard-psychologist' replace />;
    }

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

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  // Verificar si necesita completar perfil
  const needsProfileCompletion = !user.displayName || !user.username || 
                               user.displayName === user.email?.split('@')[0];
  
  if (needsProfileCompletion) {
    return <Navigate to='/complete-profile' replace />;
  }

  // Si es psicólogo, redirigir al dashboard de psicólogos
  if (user.role === 'psychologist') {
    return <Navigate to='/dashboard-psychologist' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
