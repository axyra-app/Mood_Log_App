import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertCircle, CheckCircle, Loader2, Mail, Moon, Shield, Sun, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { auth } from '../services/firebase';
import { getPasswordResetErrorMessage } from '../utils/errorMessages';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [success, countdown]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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

      // Enviar email de recuperación usando Firebase
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      setError(getPasswordResetErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Header */}
          <header
            className={`relative z-10 border-b transition-all duration-500 ${
              isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'
            } backdrop-blur-lg`}
          >
            <nav className='container mx-auto px-6 py-6'>
              <div className='flex items-center justify-between'>
                <Link to='/' className='flex items-center space-x-3 group'>
                  <Logo size='lg' />
                  <span
                    className={`text-3xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    MOOD LOG
                  </span>
                </Link>

                <div className='flex items-center space-x-4'>
                  <button
                    onClick={toggleDarkMode}
                    className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${
                      isDarkMode
                        ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isDarkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
                  </button>
                  <Link
                    to='/login'
                    className={`font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-xl transition-all duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    INICIAR SESIÓN
                  </Link>
                </div>
              </div>
            </nav>
          </header>

          {/* Success Content */}
          <div className='container mx-auto px-6 py-16'>
            <div className='max-w-2xl mx-auto text-center'>
              <div
                className={`transition-all duration-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className='mb-8'>
                  <div className='w-24 h-24 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6'>
                    <CheckCircle className='w-12 h-12 text-white' />
                  </div>
                  <h1
                    className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ¡EMAIL
                    <span className='block bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'>
                      ENVIADO!
                    </span>
                  </h1>
                  <p
                    className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Te hemos enviado un enlace para restablecer tu contraseña
                  </p>
                </div>

                <div
                  className={`rounded-3xl p-8 border-2 transition-all duration-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='mb-6'>
                    <div className='w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4'>
                      <Mail className='w-8 h-8 text-white' />
                    </div>
                    <h2
                      className={`text-2xl font-black mb-4 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      REVISA TU EMAIL
                    </h2>
                    <p
                      className={`text-lg font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Enviamos un enlace de recuperación a:
                    </p>
                    <p
                      className={`text-xl font-black mt-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}
                    >
                      {email}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-6 border-2 transition-all duration-500 ${
                      isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className='flex items-center justify-center space-x-3 mb-4'>
                      <Shield className='w-6 h-6 text-green-500' />
                      <span
                        className={`text-lg font-black transition-colors duration-500 ${
                          isDarkMode ? 'text-green-300' : 'text-green-800'
                        }`}
                      >
                        INSTRUCCIONES IMPORTANTES
                      </span>
                    </div>
                    <ul
                      className={`text-sm font-bold space-y-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-green-300' : 'text-green-700'
                      }`}
                    >
                      <li>• Revisa tu bandeja de entrada</li>
                      <li>• Si no ves el email, revisa tu carpeta de spam</li>
                      <li>• El enlace expira en 24 horas</li>
                      <li>• Haz clic en el enlace para restablecer tu contraseña</li>
                    </ul>
                  </div>

                  <div className='mt-8 space-y-4'>
                    <Link
                      to='/login'
                      className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl text-lg font-black uppercase tracking-wider transition-all duration-500 hover:scale-105 transform ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                      }`}
                    >
                      VOLVER AL LOGIN
                    </Link>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                        setCountdown(60);
                      }}
                      disabled={countdown > 0}
                      className={`w-full py-4 px-6 rounded-2xl border-2 text-lg font-bold uppercase tracking-wider transition-all duration-500 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {countdown > 0 ? `ENVIAR OTRO EMAIL (${countdown}s)` : 'ENVIAR OTRO EMAIL'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header
          className={`relative z-10 border-b transition-all duration-500 ${
            isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'
          } backdrop-blur-lg`}
        >
          <nav className='container mx-auto px-6 py-6'>
            <div className='flex items-center justify-between'>
              <Link to='/' className='flex items-center space-x-3 group'>
                <Logo size='lg' />
                <span
                  className={`text-3xl font-black transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  MOOD LOG
                </span>
              </Link>

              <div className='flex items-center space-x-4'>
                <button
                  onClick={toggleDarkMode}
                  className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isDarkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
                </button>
                <Link
                  to='/login'
                  className={`font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-xl transition-all duration-500 hover:scale-105 ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  INICIAR SESIÓN
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className='container mx-auto px-6 py-16'>
          <div className='max-w-2xl mx-auto'>
            <div
              className={`transition-all duration-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className='mb-8 text-center'>
                <div className='w-24 h-24 rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6'>
                  <Zap className='w-12 h-12 text-white' />
                </div>
                <h1
                  className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  RECUPERAR
                  <span className='block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent'>
                    CONTRASEÑA
                  </span>
                </h1>
                <p
                  className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>

              {/* Form */}
              <div
                className={`rounded-3xl p-8 border-2 transition-all duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {error && (
                  <div
                    className={`mb-6 rounded-2xl p-4 border-2 transition-all duration-500 ${
                      isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <AlertCircle className='w-6 h-6 text-red-500' />
                      <p
                        className={`font-bold transition-colors duration-500 ${
                          isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}
                      >
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                <form className='space-y-6' onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor='email'
                      className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      CORREO ELECTRÓNICO
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <Mail
                          className={`h-6 w-6 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <input
                        id='email'
                        name='email'
                        type='email'
                        autoComplete='email'
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                        }`}
                        placeholder='tu@email.com'
                      />
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl text-lg font-black uppercase tracking-wider transition-all duration-500 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-2xl hover:shadow-orange-500/50'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-2xl hover:shadow-orange-500/50'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className='w-6 h-6 mr-3 animate-spin' />
                        ENVIANDO...
                      </>
                    ) : (
                      'ENVIAR ENLACE DE RECUPERACIÓN'
                    )}
                  </button>
                </form>

                <div className='mt-8 text-center'>
                  <Link
                    to='/login'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    ← VOLVER AL LOGIN
                  </Link>
                </div>
              </div>

              {/* Help Section */}
              <div
                className={`mt-8 rounded-3xl p-6 border-2 transition-all duration-500 ${
                  isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className='flex items-center space-x-3 mb-4'>
                  <Shield className='w-6 h-6 text-blue-500' />
                  <h3
                    className={`text-lg font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}
                  >
                    ¿NECESITAS AYUDA?
                  </h3>
                </div>
                <div
                  className={`text-sm font-bold space-y-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}
                >
                  <p>Si tienes problemas para acceder a tu cuenta, también puedes:</p>
                  <ul className='list-disc list-inside space-y-1 ml-4'>
                    <li>Contactar a nuestro equipo de soporte</li>
                    <li>Verificar que el email esté escrito correctamente</li>
                    <li>Revisar tu carpeta de spam o correo no deseado</li>
                    <li>Esperar unos minutos antes de intentar nuevamente</li>
                  </ul>
                  <div
                    className={`mt-4 p-3 rounded-xl border ${
                      isDarkMode ? 'bg-blue-800/30 border-blue-600' : 'bg-blue-100 border-blue-300'
                    }`}
                  >
                    <p className='font-black'>📧 Email de soporte:</p>
                    <p className='text-purple-600 font-bold'>support@moodlogapp.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
