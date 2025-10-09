import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const LoginSimple: React.FC = () => {
  const { signIn, signInWithGoogle, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAlreadyLoggedIn, setShowAlreadyLoggedIn] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Mostrar advertencia si ya está autenticado, pero permitir acceso
  useEffect(() => {
    if (user) {
      setShowAlreadyLoggedIn(true);

      // Verificar si el usuario necesita completar su perfil
      const hasCompleteProfile = user.username && user.displayName && user.role;
      
      // Solo redirigir a completar perfil si NO tiene perfil completo
      const needsProfileCompletion = !hasCompleteProfile;

      console.log('User profile check:', {
        hasCompleteProfile,
        needsProfileCompletion,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      });

      if (needsProfileCompletion) {
        // Redirigir a completar perfil
        console.log('Redirecting to complete profile');
        navigate('/complete-profile');
      } else {
        // Redirigir según el rol del usuario
        console.log('Redirecting based on role:', user.role);
        if (user.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
      }
    } else {
      setShowAlreadyLoggedIn(false);
    }
  }, [user, navigate]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setError('');
      setLoading(true);

      await signIn(email, password);
      // La redirección se maneja en el useEffect
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleError('');
      setLoading(true);

      await signInWithGoogle();
      // La redirección se maneja en el useEffect
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setGoogleError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header
        className={`py-4 sm:py-6 px-4 sm:px-6 transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <Link to='/' className='flex items-center space-x-2 sm:space-x-3 group'>
            <Logo size="lg" />
            <span
              className={`text-lg sm:text-xl lg:text-2xl font-black transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              MOOD LOG
            </span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkMode
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex min-h-[calc(100vh-80px)]'>
        {/* Centered Form */}
        <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
          <div className='w-full max-w-md'>
            <div className='text-center mb-6 sm:mb-8'>
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                INICIAR SESIÓN
              </h1>
              <p className={`text-base sm:text-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Accede a tu cuenta y comienza tu transformación
              </p>

              {/* Notificación si ya está autenticado */}
              {showAlreadyLoggedIn && user && (
                <div
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    isDarkMode
                      ? 'bg-blue-900/30 border-blue-500 text-blue-200'
                      : 'bg-blue-50 border-blue-300 text-blue-800'
                  }`}
                >
                  <div className='flex items-center justify-center space-x-2'>
                    <span className='text-2xl'>ℹ️</span>
                    <div>
                      <p className='font-semibold'>Ya estás autenticado</p>
                      <p className='text-sm'>
                        Estás logueado como: <strong>{user.email}</strong>
                      </p>
                      <div className='mt-2 space-x-2'>
                        <button
                          onClick={() => {
                            if (user.role === 'psychologist') {
                              navigate('/dashboard-psychologist');
                            } else {
                              navigate('/dashboard');
                            }
                          }}
                          className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm'
                        >
                          Ir al Dashboard
                        </button>
                        <button
                          onClick={logout}
                          className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm'
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
              {/* Email */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  EMAIL
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder='tu@email.com'
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  CONTRASEÑA
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-3 sm:px-4 sm:py-4 pr-10 sm:pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 text-sm sm:text-base ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    error.includes('exitoso')
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className='flex items-center space-x-2'>
                    <span>{error.includes('exitoso') ? '✅' : '❌'}</span>
                    <span className='font-semibold'>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                }`}
              >
                {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
              </button>

              {/* Google Sign In */}
              <button
                type='button'
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                  isDarkMode
                    ? 'border-gray-600 text-white hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {loading ? '🔄 Conectando...' : '🔗 CONTINUAR CON GOOGLE'}
              </button>
              
              {/* Google Error */}
              {googleError && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  isDarkMode 
                    ? 'bg-red-900/30 border-red-500 text-red-200' 
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold">Error con Google</p>
                      <p className="text-sm">{googleError}</p>
                      <button
                        onClick={() => setGoogleError('')}
                        className="mt-2 text-sm underline hover:no-underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Links */}
            <div className='mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4'>
              <Link
                to='/forgot-password'
                className={`block text-xs sm:text-sm font-semibold transition-colors duration-300 hover:underline ${
                  isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <p className={`text-xs sm:text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ¿No tienes cuenta?{' '}
                <Link
                  to='/register'
                  className={`font-bold transition-colors duration-300 hover:underline ${
                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                  }`}
                >
                  REGISTRARSE
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple;
