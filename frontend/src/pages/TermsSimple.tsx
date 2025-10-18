import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TermsSimple: React.FC = () => {
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
            <Logo size="lg" />
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 hover:underline ${
              isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
            }`}
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            TÉRMINOS DE SERVICIO
          </h1>
          <p className={`text-xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Última actualización: 18 de octubre de 2025
          </p>
        </div>

        <div className={`prose prose-lg max-w-none ${
          isDarkMode ? 'prose-invert' : ''
        }`}>
          <div className={`space-y-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            
            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                1. ACEPTACIÓN DE TÉRMINOS
              </h2>
              <p className="text-lg leading-relaxed">
                Al acceder y utilizar Mood Log App, aceptas estar sujeto a estos términos de servicio. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                2. DESCRIPCIÓN DEL SERVICIO
              </h2>
              <p className="text-lg leading-relaxed">
                Mood Log App es una aplicación de seguimiento del estado de ánimo que utiliza inteligencia artificial 
                para analizar emociones y conectar usuarios con psicólogos profesionales. Nuestro servicio incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Análisis de emociones mediante IA</li>
                <li>Conexión con psicólogos certificados</li>
                <li>Chat en tiempo real</li>
                <li>Estadísticas y reportes personalizados</li>
                <li>Herramientas de bienestar emocional</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                3. CUENTA DE USUARIO
              </h2>
              <p className="text-lg leading-relaxed">
                Para utilizar nuestro servicio, debes crear una cuenta proporcionando información precisa y actualizada. 
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                4. PRIVACIDAD Y PROTECCIÓN DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Respetamos tu privacidad y protegemos tus datos personales de acuerdo con nuestra Política de Privacidad. 
                Toda la información emocional y de salud mental se maneja con la máxima confidencialidad.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                5. USO RESPONSABLE
              </h2>
              <p className="text-lg leading-relaxed">
                Te comprometes a utilizar el servicio de manera responsable y ética. No debes:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Proporcionar información falsa o engañosa</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Usar el servicio para actividades ilegales</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                6. SERVICIOS PROFESIONALES
              </h2>
              <p className="text-lg leading-relaxed">
                Los psicólogos en nuestra plataforma son profesionales certificados. Sin embargo, Mood Log App 
                no se hace responsable por la calidad de los servicios profesionales prestados por terceros.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                7. MODIFICACIONES
              </h2>
              <p className="text-lg leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                8. CONTACTO
              </h2>
              <p className="text-lg leading-relaxed">
                Si tienes preguntas sobre estos términos, puedes contactarnos en:
              </p>
              <div className="mt-4 space-y-2">
                <p>📧 Email: legal@moodlogapp.com</p>
                <p>📞 Teléfono: +1 (555) 123-4567</p>
                <p>📍 Dirección: 123 Innovation St, Tech City, TC 12345</p>
              </div>
            </section>

          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className={`inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg uppercase tracking-wider py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50`}
          >
            ACEPTAR TÉRMINOS Y CONTINUAR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsSimple;
