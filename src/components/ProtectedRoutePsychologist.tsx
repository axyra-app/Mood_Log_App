import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRoutePsychologistProps {
  children: React.ReactNode;
}

const ProtectedRoutePsychologist: React.FC<ProtectedRoutePsychologistProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [hasRendered, setHasRendered] = useState(false);

  // Timeout para evitar carga infinita
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timer);
  }, []);

  // Debug info
  useEffect(() => {
    const info = `Loading: ${loading}, User: ${!!user}, Role: ${user?.role}, Timeout: ${timeoutReached}`;
    setDebugInfo(info);
    console.log('ProtectedRoutePsychologist Debug:', info);
  }, [loading, user?.uid, user?.role, timeoutReached]);

  // Prevenir re-renderizado excesivo
  useEffect(() => {
    if (!loading && user && !hasRendered) {
      setHasRendered(true);
    }
  }, [loading, user, hasRendered]);

  // Si está cargando y no ha pasado el timeout, mostrar loading
  if (loading && !timeoutReached) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white text-lg font-semibold'>Verificando credenciales profesionales...</p>
          <p className='text-white/70 text-sm mt-2'>Debug: {debugInfo}</p>
        </div>
      </div>
    );
  }

  // Si ha pasado el timeout o no está cargando, verificar usuario
  if (timeoutReached || !loading) {
    console.log('Checking user after timeout or loading complete...');
    
    if (!user) {
      console.log('No user, redirecting to login');
      return <Navigate to='/login' replace />;
    }

    if (user.role !== 'psychologist') {
      console.log('User is not psychologist, redirecting to dashboard');
      return <Navigate to='/dashboard' replace />;
    }

    console.log('User is psychologist, showing content');
    return <>{children}</>;
  }

  // Fallback - no debería llegar aquí
  console.log('Fallback case reached');
  return <Navigate to='/login' replace />;
};

export default ProtectedRoutePsychologist;
