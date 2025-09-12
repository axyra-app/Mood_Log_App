import React, { useEffect, useState, useMemo } from 'react';
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
  const [renderCount, setRenderCount] = useState(0);

  // Timeout para evitar carga infinita
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timer);
  }, []);

  // Protección contra bucle infinito
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    if (renderCount > 50) {
      console.error('ProtectedRoutePsychologist: Bucle infinito detectado, forzando timeout');
      setTimeoutReached(true);
    }
  });

  // Memoizar el estado para evitar re-renderizados innecesarios
  const authState = useMemo(() => {
    return {
      loading,
      hasUser: !!user,
      userRole: user?.role,
      timeoutReached,
      renderCount
    };
  }, [loading, user?.uid, user?.role, timeoutReached, renderCount]);

  // Debug info
  useEffect(() => {
    const info = `Loading: ${authState.loading}, User: ${authState.hasUser}, Role: ${authState.userRole}, Timeout: ${authState.timeoutReached}, Renders: ${authState.renderCount}`;
    setDebugInfo(info);
    console.log('ProtectedRoutePsychologist Debug:', info);
  }, [authState]);

  // Lógica simplificada para evitar bucles
  const shouldShowLoading = authState.loading && !authState.timeoutReached;
  const shouldCheckUser = authState.timeoutReached || !authState.loading;

  if (shouldShowLoading) {
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

  if (shouldCheckUser) {
    if (!authState.hasUser) {
      console.log('No user, redirecting to login');
      return <Navigate to='/login' replace />;
    }

    if (authState.userRole !== 'psychologist') {
      console.log('User is not psychologist, redirecting to dashboard');
      return <Navigate to='/dashboard' replace />;
    }

    console.log('User is psychologist, showing content');
    return <>{children}</>;
  }

  // Fallback
  return <Navigate to='/login' replace />;
};

export default ProtectedRoutePsychologist;
