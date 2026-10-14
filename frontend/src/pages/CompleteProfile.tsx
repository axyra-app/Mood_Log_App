import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useValidation } from '../hooks/useValidation';

const CompleteProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { setError, hasError, getError, clearError } = useValidation();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    if (user) {
      setFormData({
        displayName: user.displayName || user.email?.split('@')[0] || '',
        username: user.username || user.email?.split('@')[0] || '',
      });
    }
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearError(name);
  };

  const validateForm = () => {
    let isValid = true;

    if (!formData.displayName.trim()) {
      setError('displayName', 'El nombre es requerido');
      isValid = false;
    }

    if (!formData.username.trim()) {
      setError('username', 'El nombre de usuario es requerido');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await updateUserProfile({
        displayName: formData.displayName,
        username: formData.username,
      });

      toast.success('¡Perfil completado! Bienvenido a Mood Log');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Error al completar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div
            className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className='p-8'>
              <div className='text-center mb-8'>
                <button
                  onClick={toggleDarkMode}
                  className={`mb-4 p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                      : 'bg-white/20 text-yellow-300 hover:bg-white/30'
                  }`}
                  aria-label='Cambiar tema'
                >
                  {isDarkMode ? '🌙' : '☀️'}
                </button>
                <div className='flex justify-center mb-4'>
                  <Logo size='lg' />
                </div>
                <h2
                  className={`text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Completa tu perfil
                </h2>
                <p
                  className={`text-sm mt-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Elige cómo quieres que te llamemos en la aplicación
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Nombre completo *
                  </label>
                  <input
                    type='text'
                    name='displayName'
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      hasError('displayName')
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder='Tu nombre'
                  />
                  {hasError('displayName') && (
                    <p className='text-red-500 text-sm mt-1'>{getError('displayName')}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Nombre de usuario *
                  </label>
                  <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      hasError('username')
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder='nombre_usuario'
                  />
                  {hasError('username') && (
                    <p className='text-red-500 text-sm mt-1'>{getError('username')}</p>
                  )}
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? 'Guardando...' : 'Comenzar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
