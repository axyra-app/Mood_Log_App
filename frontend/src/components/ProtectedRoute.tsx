import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { hasCurrentAdultEligibility, useAuth } from '../contexts/AuthContext';
import { hasCurrentLegalAcceptance } from '../services/legalAcceptanceService';
import { getProtectedRouteDecision } from '../utils/protectedRouteDecision';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowIncompleteProfile?: boolean;
}

const LoadingState: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'>
    <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center'>
      <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4'></div>
      <p className='text-white text-lg font-semibold'>Verificando acceso...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowIncompleteProfile = false }) => {
  const { user, loading } = useAuth();
  const [acceptanceState, setAcceptanceState] = useState<'checking' | 'current' | 'required' | 'error'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const adultEligible = hasCurrentAdultEligibility(user);
  const needsProfileCompletion = Boolean(user && (
    !user.displayName
    || !user.username
    || user.displayName === user.email?.split('@')[0]
  ));
  const decision = getProtectedRouteDecision({
    loading,
    isAuthenticated: Boolean(user),
    adultEligible,
    acceptanceState,
    needsProfileCompletion,
    allowIncompleteProfile,
  });

  useEffect(() => {
    let cancelled = false;
    if (!user || !adultEligible) {
      setAcceptanceState('checking');
      return () => { cancelled = true; };
    }

    setAcceptanceState('checking');
    void hasCurrentLegalAcceptance()
      .then((accepted) => {
        if (!cancelled) setAcceptanceState(accepted ? 'current' : 'required');
      })
      .catch(() => {
        if (!cancelled) setAcceptanceState('error');
      });

    return () => { cancelled = true; };
  }, [user?.uid, adultEligible, retryCount]);

  if (decision === 'loading' || decision === 'checking-acceptance') return <LoadingState />;
  if (decision === 'login') return <Navigate to='/login' replace />;
  if (decision === 'age-confirmation') return <Navigate to='/age-confirmation' replace />;
  if (decision === 'legal-acceptance') return <Navigate to='/legal-acceptance' replace />;
  if (decision === 'acceptance-error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 px-6'>
        <div role='alert' className='max-w-md rounded-2xl bg-white p-8 text-center shadow-lg'>
          <h1 className='mb-3 text-xl font-bold text-gray-900'>No se pudo verificar tu aceptación</h1>
          <p className='mb-5 text-gray-600'>No abriremos tus registros hasta comprobar la versión vigente.</p>
          <button
            type='button'
            onClick={() => setRetryCount((current) => current + 1)}
            className='rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700'
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (decision === 'complete-profile') return <Navigate to='/complete-profile' replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
