import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextSimple';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  AlertCircle, 
  Loader2,
  Heart,
  CheckCircle,
  UserCheck,
  Moon,
  Sun,
  Zap,
  Shield,
  Brain,
  Users,
  Rocket
} from 'lucide-react';
import SEO from '../components/SEO';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'psychologist'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
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
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Crear Cuenta - Mood Log App"
        description="Crea tu cuenta gratuita en Mood Log App y comienza tu viaje hacia un mejor bienestar emocional con seguimiento personalizado e insights de IA."
        keywords="crear cuenta, registro, mood log app, bienestar emocional, gratis"
      />
      
      <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header className={`relative z-10 border-b transition-all duration-500 ${isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-lg`}>
          <nav className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center space-x-3 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <span className={`text-3xl font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  MOOD LOG
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link
                  to="/login"
                  className={`font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-xl transition-all duration-500 hover:scale-105 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  INICIAR SESIÓN
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Form */}
              <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <div className="mb-8">
                  <h1 className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¡COMIENZA TU
                    <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      TRANSFORMACIÓN!
                    </span>
                  </h1>
                  <p className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Crea tu cuenta gratuita y experimenta una evolución emocional BRUTAL
                  </p>
                </div>

                {/* Registration Form */}
                <div className={`rounded-3xl p-8 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  {error && (
                    <div className={`mb-6 rounded-2xl p-4 border-2 transition-all duration-500 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <p className={`font-bold transition-colors duration-500 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div>
                      <label className={`block text-lg font-black uppercase tracking-wider mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ¿CÓMO TE GUSTARÍA USAR LA APLICACIÓN?
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-105 ${
                          formData.role === 'user' 
                            ? `${isDarkMode ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50'}` 
                            : `${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                        }`}>
                          <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={formData.role === 'user'}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className={`font-black text-lg transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>USUARIO</div>
                              <div className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Seguir mi bienestar</div>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-105 ${
                          formData.role === 'psychologist' 
                            ? `${isDarkMode ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50'}` 
                            : `${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                        }`}>
                          <input
                            type="radio"
                            name="role"
                            value="psychologist"
                            checked={formData.role === 'psychologist'}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className={`font-black text-lg transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>PROFESIONAL</div>
                              <div className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ayudar pacientes</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          NOMBRE
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`block w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}
                            placeholder="Tu nombre"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lastName" className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          APELLIDO
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`block w-full px-4 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        CORREO ELECTRÓNICO
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`block w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="password" className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          CONTRASEÑA
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`block w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
                            ) : (
                              <Eye className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={`block text-lg font-black uppercase tracking-wider mb-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          CONFIRMAR CONTRASEÑA
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`block w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}
                            placeholder="Repite tu contraseña"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
                            ) : (
                              <Eye className={`h-6 w-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className={`h-5 w-5 rounded border-2 transition-all duration-500 mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500' : 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500'}`}
                      />
                      <label htmlFor="terms" className={`ml-3 block text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Acepto los{' '}
                        <Link to="/terms" className={`font-black transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                          TÉRMINOS DE SERVICIO
                        </Link>{' '}
                        y la{' '}
                        <Link to="/privacy" className={`font-black transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                          POLÍTICA DE PRIVACIDAD
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl text-lg font-black uppercase tracking-wider transition-all duration-500 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'}`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          CREANDO CUENTA...
                        </>
                      ) : (
                        'CREAR CUENTA GRATIS'
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="mt-8">
                    <div className="relative">
                      <div className={`absolute inset-0 flex items-center transition-colors duration-500 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className={`w-full border-t-2 transition-colors duration-500 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-4 font-bold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                          O REGÍSTRATE CON
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Sign Up */}
                  <div className="mt-8">
                    <button
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      className={`w-full flex justify-center items-center py-4 px-6 rounded-2xl border-2 text-lg font-bold uppercase tracking-wider transition-all duration-500 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'}`}
                    >
                      <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      CONTINUAR CON GOOGLE
                    </button>
                  </div>

                  {/* Sign In Link */}
                  <div className="mt-8 text-center">
                    <p className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ¿YA TIENES UNA CUENTA?{' '}
                      <Link
                        to="/login"
                        className={`font-black transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                      >
                        INICIA SESIÓN AQUÍ
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Benefits */}
              <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <div className={`rounded-3xl p-8 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-3xl font-black mb-8 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¿QUÉ INCLUYE TU
                    <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      CUENTA GRATUITA?
                    </span>
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          SEGUIMIENTO ILIMITADO
                        </h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          De tu estado de ánimo sin restricciones
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          INSIGHTS BÁSICOS CON IA
                        </h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Análisis inteligente de tus patrones emocionales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ESTADÍSTICAS Y GRÁFICOS
                        </h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Visualizaciones que muestran tu progreso
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ACCESO A PROFESIONALES
                        </h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Conecta con psicólogos certificados (opcional)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          SOPORTE POR EMAIL
                        </h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ayuda cuando la necesites
                        </p>
                      </div>
                    </div>
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

export default Register;