import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';
import { hasCurrentAdultEligibility, useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AgeConfirmation: React.FC = () => {
  const { user, loading, confirmAdultEligibility } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600' />
      </div>
    );
  }

  if (!user) return <Navigate to='/login' replace />;
  if (hasCurrentAdultEligibility(user)) return <Navigate to='/dashboard' replace />;

  const handleContinue = async () => {
    if (!confirmedAdult) {
      toast.error('Confirma que tienes 18 años o más para continuar.');
      return;
    }

    try {
      setSaveError('');
      setSaving(true);
      await confirmAdultEligibility(confirmedAdult);
      toast.success('Confirmación guardada.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la confirmación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`min-h-screen flex items-center justify-center p-6 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <section className={`w-full max-w-lg rounded-2xl border p-8 shadow-lg ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className='mb-6 flex justify-center'><Logo size='lg' /></div>
        <h1 className='mb-3 text-2xl font-bold'>Confirma tu edad</h1>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Mood Log está disponible inicialmente para personas adultas. Para continuar, confirma que tienes 18 años o más.
          Esta confirmación no reemplaza las verificaciones que puedan requerirse por ley.
        </p>
        <label className='mb-6 flex items-start gap-3'>
          <input
            type='checkbox'
            checked={confirmedAdult}
            onChange={(event) => setConfirmedAdult(event.target.checked)}
            className='mt-1 h-4 w-4 accent-purple-600'
          />
          <span>Confirmo que tengo 18 años o más.</span>
        </label>
        {saveError && <p role='alert' className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>{saveError}</p>}
        <button
          type='button'
          onClick={handleContinue}
          disabled={saving || !confirmedAdult}
          className='w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {saving ? 'Guardando…' : 'Continuar'}
        </button>
      </section>
    </main>
  );
};

export default AgeConfirmation;
