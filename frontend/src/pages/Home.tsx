import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, Shield, BarChart3, MessageCircle, Calendar, Star, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Mood Log Logo" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-gray-900">MOOD LOG</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Revolución Emocional
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Transformación
            </span>
            <br />
            Emocional
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            IA de última generación que analiza tus emociones con precisión milimétrica.
            <br />
            Conecta con los mejores psicólogos del mundo. Tu evolución será BRUTAL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg inline-flex items-center"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Análisis con IA</h3>
            <p className="text-gray-600">
              Recibe análisis inteligente de tus estados de ánimo con múltiples personalidades de IA especializadas.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Psicólogos Reales</h3>
            <p className="text-gray-600">
              Conecta con psicólogos profesionales verificados para recibir apoyo personalizado.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Detección de Crisis</h3>
            <p className="text-gray-600">
              Sistema avanzado de detección de crisis que te conecta inmediatamente con ayuda profesional.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Estadísticas Detalladas</h3>
            <p className="text-gray-600">
              Visualiza tu progreso con gráficos y estadísticas que te ayudan a entender tus patrones.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chat Integrado</h3>
            <p className="text-gray-600">
              Comunícate fácilmente con psicólogos o IA a través de nuestro sistema de chat integrado.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Citas</h3>
            <p className="text-gray-600">
              Programa y gestiona tus citas con psicólogos de manera fácil y organizada.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <Star className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Transformar tu Bienestar Mental?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están mejorando su bienestar mental con nuestra plataforma.
          </p>
          <Link
            to="/register"
            className="bg-white text-purple-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/logo.png" alt="Mood Log Logo" className="h-6 w-6" />
              <span className="text-gray-900 font-semibold">MOOD LOG</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Términos
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacidad
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Soporte
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-4">
            <p>&copy; 2025 Mood Log App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
