import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, hasCurrentAdultEligibility } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  grantSensitiveSelfReportConsent,
  hasCurrentSensitiveSelfReportConsent,
  revokeSensitiveSelfReportConsent,
} from '../services/sensitiveDataConsentService';

const SensitiveDataConsent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedReturnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
  const returnTo = requestedReturnTo === '/mood-flow' || requestedReturnTo === '/journal'
    ? requestedReturnTo
    : '/settings';
  const returnLabel = returnTo === '/mood-flow' ? 'registro de ánimo' : returnTo === '/journal' ? 'diario' : 'Ajustes';
  const continueLabel = returnTo === '/settings' ? 'Continuar a Ajustes' : `Continuar al ${returnLabel}`;
  const adultEligible = hasCurrentAdultEligibility(user);
  const [isChecking, setIsChecking] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setIsChecking(true);
    setErrorMessage('');
    try {
      setIsAccepted(await hasCurrentSensitiveSelfReportConsent());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo consultar la autorización.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!loading && user) void refresh();
  }, [loading, user?.uid]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to='/login' replace />;
  if (isChecking) return <LoadingSpinner />;

  const accept = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adultEligible) {
      setErrorMessage('Completa primero la confirmación de edad.');
      return;
    }
    if (!checked) {
      setErrorMessage('Marca la casilla si deseas dar esta autorización opcional.');
      return;
    }
    try {
      setSaving(true);
      setErrorMessage('');
      await grantSensitiveSelfReportConsent();
      setIsAccepted(true);
      setNotice('Autorización registrada. Ya puedes guardar registros de ánimo y diario.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la autorización.');
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    if (!window.confirm('Al retirarla no podrás crear ni editar registros de ánimo o diario. Los datos existentes no se borrarán automáticamente. ¿Retirar autorización?')) return;
    try {
      setSaving(true);
      setErrorMessage('');
      await revokeSensitiveSelfReportConsent();
      setIsAccepted(false);
      setChecked(false);
      setNotice('Autorización retirada. Los registros existentes siguen en tu cuenta y puedes exportarlos o eliminarlos desde Ajustes.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo retirar la autorización.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className='min-h-screen mood-canvas px-5 py-10'>
      <section className='mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900 sm:p-9'>
        <Link to={returnTo} className='text-sm font-medium text-purple-700 hover:underline dark:text-purple-300'>← Volver a {returnLabel}</Link>
        <h1 className='mb-3 mt-5 text-2xl font-bold'>Autorización opcional para registros personales</h1>
        <p className='mb-5 text-sm leading-6 text-gray-700 dark:text-gray-300'>
          Mood Log puede guardar en tu cuenta registros de ánimo, energía, estrés, sueño, emociones, actividades, notas y entradas del diario para mostrarte tu historial, estadísticas y reflexiones que solicites.
        </p>
        <div className='space-y-3 rounded-xl border border-gray-200 p-4 text-sm leading-6 dark:border-gray-700'>
          <p><strong>Almacenamiento:</strong> los registros se guardan en la base de datos de Mood Log provista por Firebase y se asocian a tu cuenta.</p>
          <p><strong>IA:</strong> esta autorización no permite enviar texto a Groq. Para cada tarea de IA se solicita una autorización adicional.</p>
          <p><strong>Wearables:</strong> esta autorización no incluye pulsaciones ni otros datos del reloj; se solicitará por separado si se incorpora esa función.</p>
          <p><strong>Opcionalidad:</strong> puedes usar tu cuenta sin autorizar esta función. Mientras no esté activa, no podrás crear ni modificar registros de ánimo o diario.</p>
          <p><strong>Retiro:</strong> puedes retirarla en cualquier momento. El retiro bloquea nuevos guardados, cambios y solicitudes de análisis con IA. Los registros existentes no se borran automáticamente y siguen disponibles en tu historial y estadísticas hasta que los elimines. Puedes exportarlos o solicitar su eliminación en Ajustes. El tratamiento de registros existentes después del retiro requiere validación jurídica antes del lanzamiento.</p>
        </div>
        <p className='my-5 rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'>
          Borrador técnico: el texto y el flujo deben ser revisados por asesoría jurídica colombiana antes del lanzamiento comercial.
        </p>

        {isAccepted ? (
          <div className='space-y-4'>
            <p role='status' className='text-sm font-medium text-green-700 dark:text-green-300'>Esta autorización está activa para la versión vigente.</p>
            {notice && (
              <button type='button' onClick={() => navigate(returnTo, { replace: true })} className='rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800'>
                {continueLabel}
              </button>
            )}
            <button type='button' onClick={() => void revoke()} disabled={saving} className='rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40'>
              {saving ? 'Guardando…' : 'Retirar autorización'}
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void accept(event)} className='space-y-4'>
            <label className='flex items-start gap-3 text-sm leading-6'>
              <input type='checkbox' checked={checked} onChange={(event) => setChecked(event.target.checked)} className='mt-1' />
              <span>Autorizo de forma opcional a Mood Log a tratar los registros descritos para guardarlos en mi cuenta y permitirme consultar mi historial, estadísticas y reflexiones solicitadas. Entiendo que puedo retirar esta autorización.</span>
            </label>
            <button type='submit' disabled={saving || !checked || !adultEligible} className='rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50'>
              {saving ? 'Registrando…' : 'Autorizar almacenamiento de mis registros'}
            </button>
            {!adultEligible && <p className='text-sm text-amber-700'>Completa la confirmación de edad para autorizar.</p>}
          </form>
        )}

        {notice && <p role='status' className='mt-4 text-sm text-green-700 dark:text-green-300'>{notice}</p>}
        {errorMessage && <div role='alert' className='mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200'>{errorMessage} <button type='button' className='ml-2 underline' onClick={() => void refresh()}>Reintentar</button></div>}
        <button type='button' onClick={() => void logout()} className='mt-7 text-sm text-gray-600 underline dark:text-gray-400'>Cerrar sesión</button>
      </section>
    </main>
  );
};

export default SensitiveDataConsent;
