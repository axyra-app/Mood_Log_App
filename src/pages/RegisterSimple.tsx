import React, { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterSimple: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'psychologist'
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Por favor completa todos los campos');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    if (!agreedToTerms) {
      setError('Debes aceptar los términos de servicio y política de privacidad');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setError('');
      setLoading(true);
      
      // Aquí iría la lógica real de Firebase Auth
      // Por ahora redirigimos al dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      setError('Error en el registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Aquí iría la lógica real de Google Auth
      // Por ahora redirigimos al dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      setError('Error en el registro con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`py-6 px-6 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-lg border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-lg">💜</span>
            </div>
            <span className={`text-2xl font-black transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              MOOD LOG
            </span>
          </Link>
          
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
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
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Centered Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                CREAR CUENTA
              </h1>
              <p className={`text-lg transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Únete a la revolución emocional
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className={`block text-sm font-bold mb-3 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  TIPO DE CUENTA
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.role === 'user'
                        ? isDarkMode
                          ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                          : 'border-purple-500 bg-purple-50 text-purple-600'
                        : isDarkMode
                        ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-bold text-sm">USUARIO</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'psychologist' }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.role === 'psychologist'
                        ? isDarkMode
                          ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                          : 'border-purple-500 bg-purple-50 text-purple-600'
                        : isDarkMode
                        ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🧠</div>
                    <div className="font-bold text-sm">PSICÓLOGO</div>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    APELLIDO
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CONTRASEÑA
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CONFIRMAR
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={`mt-1 w-5 h-5 rounded border-2 transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-purple-600 focus:ring-purple-500/20'
                      : 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500/20'
                  }`}
                />
                <label htmlFor="terms" className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Acepto los{' '}
                  <Link to="/terms" className="text-purple-600 hover:underline font-semibold">
                    términos de servicio
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacy" className="text-purple-600 hover:underline font-semibold">
                    política de privacidad
                  </Link>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`p-4 rounded-xl border-2 ${
                  error.includes('exitoso') 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{error.includes('exitoso') ? '✅' : '❌'}</span>
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                }`}
              >
                {loading ? 'CREANDO...' : 'CREAR CUENTA'}
              </button>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                  isDarkMode
                    ? 'border-gray-600 text-white hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔗 CONTINUAR CON GOOGLE
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className={`font-bold transition-colors duration-300 hover:underline ${
                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                  }`}
                >
                  INICIAR SESIÓN
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSimple;
