import { MessageCircle, Bot, User, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const ChatSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAIChat = (doctorType: 'dr-sofia' | 'dr-carlos') => {
    navigate(`/chat/${doctorType}`);
  };

  const handlePsychologistChat = () => {
    if (user?.role === 'psychologist') {
      navigate('/psychologist-chat');
    } else {
      navigate('/user-chat');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-pink-50'
    }`}>
      <Header 
        title="Chat de Apoyo"
        subtitle="Elige el tipo de ayuda que mejor se adapte a tus necesidades"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Hola, {user?.displayName || 'Usuario'}! 👋
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Estamos aquí para apoyarte. Elige el tipo de ayuda que mejor se adapte a tus necesidades en este momento.
          </p>
        </div>

        {/* Chat Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Chat Option */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } p-8`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Asistente IA
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Respuestas inmediatas 24/7 con inteligencia artificial especializada
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Disponible 24/7
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Respuestas inmediatas
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Basado en evidencia médica
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAIChat('dr-sofia')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Dr. Sofia IA - Medicina General</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleAIChat('dr-carlos')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Dr. Carlos IA - Psicología Clínica</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Psychologist Chat Option */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } p-8`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Psicólogo Real
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Conecta con psicólogos profesionales certificados para atención personalizada
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Horario de atención: 9:00 - 18:00
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Profesionales certificados
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Atención personalizada
                </span>
              </div>
            </div>

            <button
              onClick={handlePsychologistChat}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Conectar con Psicólogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Information Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ℹ️ Información Importante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                🤖 Asistente IA
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Respuestas basadas en evidencia médica</li>
                <li>• No reemplaza la consulta médica profesional</li>
                <li>• Ideal para consultas generales y primeros auxilios</li>
                <li>• Siempre disponible</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                👨‍⚕️ Psicólogo Real
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Atención profesional certificada</li>
                <li>• Diagnósticos y tratamientos especializados</li>
                <li>• Seguimiento personalizado</li>
                <li>• Disponible en horario de atención</li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              <strong>⚠️ En caso de emergencia:</strong> Si tienes pensamientos de autolesión o suicidio, 
              contacta inmediatamente con la línea de crisis: <strong>106</strong> (Colombia) 
              o acude a urgencias del hospital más cercano.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSelection;
