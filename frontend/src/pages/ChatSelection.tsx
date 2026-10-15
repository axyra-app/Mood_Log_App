import { ArrowRight, Bot, Clock, Heart, Shield, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const ChatSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setIsDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const handleAIChat = (assistantId: 'mia' | 'reflection') => {
    navigate(`/chat/assistant/${assistantId}`);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 text-gray-900'
      }`}
    >
      <Header
        title='Confidente IA'
        subtitle='Tu espacio personal, seguro y reflexivo 24/7'
        backTo='/dashboard'
        backLabel='Volver al Dashboard'
      />

      <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='text-center mb-10'>
          <h2 className='text-3xl font-bold mb-3'>
            ¡Hola, {user?.displayName || 'Usuario'}! 👋
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Estamos aquí para escucharte sin juicios. Elige el enfoque de autorreflexión que prefieras:
          </p>
        </div>

        {/* Chat Options */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
          {/* Confidante 1: Empático */}
          <div
            className={`rounded-2xl shadow-xl border p-8 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
            }`}
          >
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md'>
                <Heart className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-2xl font-bold mb-2'>Espacio de Desahogo</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Una conversación cálida para poner en palabras lo que sientes y ordenar tus ideas.
              </p>
            </div>

            <div className='space-y-3 mb-6 text-sm'>
              <div className='flex items-center space-x-3'>
                <Clock className='w-4 h-4 text-green-500' />
                <span>Disponible 24/7 a tu propio ritmo</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Shield className='w-4 h-4 text-purple-500' />
                <span>Un espacio de autorreflexión sin juicios</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Sparkles className='w-4 h-4 text-pink-500' />
                <span>Ideal para desahogarse y calmar la mente</span>
              </div>
            </div>

            <button
              onClick={() => handleAIChat('mia')}
              className='w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md'
            >
              <User className='w-5 h-5' />
              <span>Conversar con Mia</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>

          {/* Confidante 2: Reflexivo */}
          <div
            className={`rounded-2xl shadow-xl border p-8 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
            }`}
          >
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md'>
                <Bot className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-2xl font-bold mb-2'>Guía Reflexivo</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Preguntas para observar patrones, hábitos y perspectivas con mayor claridad.
              </p>
            </div>

            <div className='space-y-3 mb-6 text-sm'>
              <div className='flex items-center space-x-3'>
                <Clock className='w-4 h-4 text-green-500' />
                <span>Disponible 24/7 de forma inmediata</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Shield className='w-4 h-4 text-blue-500' />
                <span>Respuestas reflexivas estructuradas</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Sparkles className='w-4 h-4 text-indigo-500' />
                <span>Ideal para resolver dilemas y ordenar ideas</span>
              </div>
            </div>

            <button
              onClick={() => handleAIChat('reflection')}
              className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md'
            >
              <User className='w-5 h-5' />
              <span>Usar la guía reflexiva</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Disclaimer / Información Importante */}
        <div
          className={`rounded-2xl shadow-md border p-6 ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-purple-50/60 border-purple-200'
          }`}
        >
          <div className='flex items-start space-x-3'>
            <span className='text-2xl'>💡</span>
            <div>
              <h4 className='font-semibold text-base mb-1'>Nota sobre privacidad y bienestar</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Estas respuestas son generadas por IA para apoyar la autorreflexión; no son atención clínica, asesoría médica ni un servicio de emergencia. Si existe peligro inmediato, contacta los servicios de emergencia de tu localidad o a una persona de confianza.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSelection;
