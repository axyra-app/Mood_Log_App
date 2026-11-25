import React, { FormEvent, useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { hasCurrentAdultEligibility, useAuth } from '../contexts/AuthContext';
import { hasCurrentLegalAcceptance, recordCurrentLegalAcceptance } from '../services/legalAcceptanceService';

const LegalAcceptance: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const adultEligible = hasCurrentAdultEligibility(user);
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (loading || !user || !adultEligible) return;
    let cancelled = false;
    setIsChecking(true);
    void hasCurrentLegalAcceptance()
      .then((isCurrent) => {
        if (cancelled) return;
        setNeedsAcceptance(!isCurrent);
        if (isCurrent) navigate('/dashboard', { replace: true });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'No se pudo comprobar la versión vigente.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });
    return () => { cancelled = true; };
  }, [loading, user?.uid, adultEligible, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to='/login' replace />;
  if (!adultEligible) return <Navigate to='/age-confirmation' replace />;
  if (isChecking) return <LoadingSpinner />;
  if (!needsAcceptance && !errorMessage) return <LoadingSpinner />;

  const submitAcceptance = async (event: FormEvent) => {
    event.preventDefault();
    if (!accepted) {
      setErrorMessage('Marca la casilla para continuar.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      await recordCurrentLegalAcceptance('renewal');
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la aceptación.');
    } finally {
      setSaving(false);
    }
  };

  const retryCheck = async () => {
    setIsChecking(true);
    setErrorMessage('');
    try {
      const isCurrent = await hasCurrentLegalAcceptance();
      setNeedsAcceptance(!isCurrent);
      if (isCurrent) navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo comprobar la versión vigente.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className='min-h-screen mood-canvas px-5 py-12'>
      <section className='mx-auto max-w-xl rounded-2xl bg-white p-7 shadow-lg sm:p-9'>
        <h1 className='mb-3 text-2xl font-bold text-gray-900'>Revisa los documentos vigentes</h1>
        <p className='mb-6 text-gray-700'>Actualizamos los documentos de Mood Log. Revisa los textos antes de continuar. Puedes cerrar sesión si no deseas aceptarlos.</p>

        <div className='mb-6 space-y-3 rounded-xl border border-gray-200 p-4'>
          <p><Link className='font-semibold text-purple-700 underline' to='/terms'>Leer términos y condiciones</Link></p>
          <p><Link className='font-semibold text-purple-700 underline' to='/privacy'>Leer aviso de privacidad</Link></p>
        </div>

        {needsAcceptance ? (
          <form onSubmit={submitAcceptance} className='space-y-5'>
            <label className='flex items-start gap-3 text-sm leading-6 text-gray-800'>
              <input
                type='checkbox'
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className='mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
              />
              <span>Acepto los términos y confirmo que recibí y revisé el aviso de privacidad. Esta acción no autoriza el uso de datos de salud, analítica ni IA.</span>
            </label>
            {errorMessage && <p role='alert' className='text-sm text-red-700'>{errorMessage}</p>}
            <button
              type='submit'
              disabled={!accepted || saving}
              className='w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving ? 'Guardando…' : 'Confirmar y continuar'}
            </button>
            <button
              type='button'
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
              className='w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50'
            >
              Volver a iniciar sesión más tarde
            </button>
          </form>
        ) : (
          <div role='alert' className='space-y-4'>
            <p className='text-sm text-red-700'>{errorMessage}</p>
            <button
              type='button'
              onClick={retryCheck}
              className='rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700'
            >
              Reintentar verificación
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default LegalAcceptance;
