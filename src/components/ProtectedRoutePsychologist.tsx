import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from './ErrorBoundary';

interface ProtectedRoutePsychologistProps {
  children: React.ReactNode;
}

const ProtectedRoutePsychologist: React.FC<ProtectedRoutePsychologistProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [forceResolve, setForceResolve] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const hasResolvedRef = useRef(false);

  // Contador de renders para detectar bucles
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`ProtectedRoutePsychologist render #${renderCount + 1}`);
  });

  // Forzar resolución después de 3 segundos o 15 renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasResolvedRef.current) {
        console.log('Forzando resolución del loading...');
        setForceResolve(true);
        setIsResolved(true);
        hasResolvedRef.current = true;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Detectar bucle infinito
  useEffect(() => {
    if (renderCount > 15 && !hasResolvedRef.current) {
      console.error('Bucle infinito detectado, forzando resolución');
      setForceResolve(true);
      setIsResolved(true);
      hasResolvedRef.current = true;
    }
  }, [renderCount]);

  // Lógica simplificada
  const shouldShowLoading = loading && !forceResolve && !isResolved;
  const shouldCheckUser = forceResolve || !loading || isResolved;

  console.log('ProtectedRoutePsychologist state:', {
    loading,
    hasUser: !!user,
    userRole: user?.role,
    forceResolve,
    isResolved,
    renderCount
  });

  if (shouldShowLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white text-lg font-semibold'>Verificando credenciales profesionales...</p>
          <p className='text-white/70 text-sm mt-2'>Render: {renderCount}</p>
        </div>
      </div>
    );
  }

  if (shouldCheckUser) {
    if (!user) {
      console.log('No user, redirecting to login');
      return <Navigate to='/login' replace />;
    }

    if (user.role !== 'psychologist') {
      console.log('User is not psychologist, redirecting to dashboard');
      return <Navigate to='/dashboard' replace />;
    }

    console.log('User is psychologist, showing content');
    // Usar ErrorBoundary para capturar errores del componente
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // Fallback
  return <Navigate to='/login' replace />;
};

export default ProtectedRoutePsychologist;
