import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardSimple: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
          
          <div className="flex items-center space-x-4">
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
            <button
              onClick={() => window.location.href = '/login'}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¡BIENVENIDO A TU DASHBOARD!
          </h1>
          <p className={`text-xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Tu transformación emocional comienza aquí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mood Tracking Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">😊</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              REGISTRAR ESTADO DE ÁNIMO
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Registra cómo te sientes y obtén análisis con IA
            </p>
          </div>

          {/* Chat with Psychologist Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              CHAT CON PSICÓLOGO
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Conecta con profesionales de la salud mental
            </p>
          </div>

          {/* Statistics Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ESTADÍSTICAS
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Ve tu progreso y patrones emocionales
            </p>
          </div>

          {/* AI Analysis Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">🧠</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ANÁLISIS CON IA
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Obtén insights personalizados sobre tu bienestar
            </p>
          </div>

          {/* Goals Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              OBJETIVOS
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Establece y alcanza tus metas de bienestar
            </p>
          </div>

          {/* Settings Card */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}>
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className={`text-2xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              CONFIGURACIÓN
            </h3>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Personaliza tu experiencia en la aplicación
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className={`p-8 rounded-2xl border-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🚀 FUNCIONALIDADES EN DESARROLLO
            </h2>
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Estamos trabajando para traerte la mejor experiencia de seguimiento emocional. 
              Pronto tendrás acceso a todas estas funcionalidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;
