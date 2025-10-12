import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, BarChart3, MessageCircle, Calendar, Star, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <Logo size="lg" />
            </div>
            <div className="flex space-x-3 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base font-medium"
              >
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Entrar</span>
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm sm:text-base shadow-sm"
              >
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Registro</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Revolución Emocional
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Tu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Transformación
            </span>
            <br />
            Emocional
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            IA de última generación que analiza tus emociones con precisión milimétrica.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Conecta con los mejores psicólogos del mundo. Tu evolución será BRUTAL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/register"
              className="bg-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-base sm:text-lg inline-flex items-center justify-center"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-purple-600 text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold text-base sm:text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Análisis con IA</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Recibe análisis inteligente de tus estados de ánimo con múltiples personalidades de IA especializadas.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Psicólogos Reales</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Conecta con psicólogos profesionales verificados para recibir apoyo personalizado.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Detección de Crisis</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Sistema avanzado de detección de crisis que te conecta inmediatamente con ayuda profesional.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Estadísticas Detalladas</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Visualiza tu progreso con gráficos y estadísticas que te ayudan a entender tus patrones.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Chat Integrado</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Comunícate fácilmente con psicólogos o IA a través de nuestro sistema de chat integrado.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Gestión de Citas</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Programa y gestiona tus citas con psicólogos de manera fácil y organizada.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white">
          <Star className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-300 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            ¿Listo para Transformar tu Bienestar Mental?
          </h2>
          <p className="text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Únete a miles de usuarios que ya están mejorando su bienestar mental con nuestra plataforma.
          </p>
          <Link
            to="/register"
            className="bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-base sm:text-lg inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="sm" />
            </div>
            <div className="flex space-x-4 sm:space-x-6">
              <Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                Términos
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                Privacidad
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                Soporte
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-4 text-xs sm:text-sm">
            <p>&copy; 2025 Mood Log App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
