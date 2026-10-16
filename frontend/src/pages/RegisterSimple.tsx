import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useValidation } from '../hooks/useValidation';

const RegisterSimple: React.FC = () => {
  const { signUp, signUpWithGoogle, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { setError, hasError, getError, clearError } = useValidation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirigir usuarios autenticados
  useEffect(() => {
    if (user) {
      // Solo redirigir si estamos en la página de registro
      const currentPath = window.location.pathname;
      if (currentPath !== '/register') {
        return; // No redirigir si ya estamos en otra página
      }

      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearError(name);
  };

  const validateForm = () => {
    let isValid = true;

    // Validar nombre sin números
    if (!formData.firstName.trim()) {
      setError('firstName', 'El nombre es requerido');
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName)) {
      setError('firstName', 'El nombre no debe contener números ni caracteres especiales');
      isValid = false;
    } else if (formData.firstName.trim().length < 2) {
      setError('firstName', 'El nombre debe tener al menos 2 caracteres');
      isValid = false;
    }

    // Validar apellido sin números
    if (!formData.lastName.trim()) {
      setError('lastName', 'El apellido es requerido');
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName)) {
      setError('lastName', 'El apellido no debe contener números ni caracteres especiales');
      isValid = false;
    } else if (formData.lastName.trim().length < 2) {
      setError('lastName', 'El apellido debe tener al menos 2 caracteres');
      isValid = false;
    }

    if (!formData.email.trim()) {
      setError('email', 'El correo electrónico es requerido');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('email', 'El correo electrónico no es válido');
      isValid = false;
    }

    if (!formData.password) {
      setError('password', 'La contraseña es requerida');
      isValid = false;
    } else if (formData.password.length < 6) {
      setError('password', 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('confirmPassword', 'Las contraseñas no coinciden');
      isValid = false;
    }

    if (!agreedToTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp(formData.email, formData.password);
      toast.success('¡Cuenta creada! Bienvenido a Mood Log');
      // No navegar manualmente, dejar que onAuthStateChanged maneje la navegación
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
      toast.success('¡Cuenta creada con Google! Completa tu perfil para continuar');

      // No navegar manualmente, dejar que onAuthStateChanged maneje la navegación
    } catch (error: any) {
      console.error('Google registration error:', error);
      toast.error(error.message || 'Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      } safe-area-top safe-area-bottom`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between mobile-padding py-4'>
          <Link to='/' className='flex items-center space-x-2 sm:space-x-3 group'>
            <Logo size='lg' />
          </Link>

          <div className='flex items-center space-x-3 sm:space-x-4'>
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
            <Link
              to='/login'
              className={`font-bold text-sm uppercase tracking-wider py-2 px-4 sm:py-3 sm:px-6 rounded-xl transition-all duration-500 hover:scale-105 ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className='hidden sm:inline'>Iniciar Sesión</span>
              <span className='sm:hidden'>Entrar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='min-h-screen flex items-center justify-center mobile-padding'>
        <div className='w-full max-w-2xl'>
          <div
            className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className='mobile-card'>
              <div className='text-center mb-8'>
                <h1
                  className={`mobile-heading font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Crear Cuenta
                </h1>
                <p
                  className={`mobile-text transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Únete a nuestra comunidad de bienestar
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      NOMBRE *
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('firstName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Tu nombre'
                    />
                    {hasError('firstName') && <p className='text-red-500 text-sm mt-1'>{getError('firstName')}</p>}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      APELLIDO *
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('lastName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Tu apellido'
                    />
                    {hasError('lastName') && <p className='text-red-500 text-sm mt-1'>{getError('lastName')}</p>}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    CORREO ELECTRÓNICO *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      hasError('email')
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder='tu@email.com'
                  />
                  {hasError('email') && <p className='text-red-500 text-sm mt-1'>{getError('email')}</p>}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONTRASEÑA *
                    </label>
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('password')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Mínimo 6 caracteres'
                    />
                    {hasError('password') && <p className='text-red-500 text-sm mt-1'>{getError('password')}</p>}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONFIRMAR CONTRASEÑA *
                    </label>
                    <input
                      type='password'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('confirmPassword')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Repite tu contraseña'
                    />
                    {hasError('confirmPassword') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('confirmPassword')}</p>
                    )}
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    id='terms'
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                  />
                  <label
                    htmlFor='terms'
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Acepto los{' '}
                    <Link to='/terms' className='text-purple-600 hover:text-purple-700 underline'>
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link to='/privacy' className='text-purple-600 hover:text-purple-700 underline'>
                      política de privacidad
                    </Link>
                  </label>
                </div>

                <div className='space-y-4'>
                  <button
                    type='submit'
                    disabled={loading || !agreedToTerms}
                    className='w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg'
                  >
                    {loading ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Creando cuenta...
                      </div>
                    ) : (
                      'CREAR CUENTA'
                    )}
                  </button>

                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-300'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span
                        className={`px-2 transition-colors duration-500 ${
                          isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                        }`}
                      >
                        O continúa con
                      </span>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className='w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                  >
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </div>

                <div className='text-center'>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                      to='/login'
                      className='text-purple-600 hover:text-purple-700 font-bold transition-colors duration-300'
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSimple;
