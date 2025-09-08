import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div className='text-6xl mb-4'>📧</div>
          <h2 className='text-3xl font-bold text-gray-900'>Email Enviado</h2>
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <p className='text-green-800 text-sm'>
                Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
              </p>
            </div>
          </div>
          <p className='text-gray-600 text-sm'>
            Revisa tu bandeja de entrada y sigue las instrucciones. Si no ves el email, revisa tu carpeta de spam.
          </p>
          <div className='space-y-3'>
            <Link
              to='/login'
              className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            >
              Volver al Login
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className='w-full text-sm text-primary-600 hover:text-primary-500'
            >
              Enviar otro email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='flex items-center justify-center mb-4'>
            <Link to='/login' className='p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100'>
              <ArrowLeft className='w-6 h-6' />
            </Link>
          </div>
          <div className='text-4xl mb-4'>🔐</div>
          <h2 className='text-3xl font-bold text-gray-900'>Recuperar Contraseña</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Form */}
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center space-x-2'>
                <AlertCircle className='w-5 h-5 text-red-500' />
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                placeholder='tu@email.com'
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                Enviando...
              </>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </button>

          {/* Back to Login */}
          <div className='text-center'>
            <Link to='/login' className='text-sm text-primary-600 hover:text-primary-500'>
              ← Volver al Login
            </Link>
          </div>
        </form>

        {/* Help Text */}
        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h3 className='text-sm font-medium text-blue-800 mb-2'>¿Necesitas ayuda?</h3>
          <p className='text-sm text-blue-700'>
            Si tienes problemas para acceder a tu cuenta, también puedes contactar a nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
