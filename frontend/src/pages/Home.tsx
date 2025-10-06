import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Brain, Users, Shield, BarChart3, MessageCircle, Calendar, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">MOOD LOG</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-200 font-semibold"
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tu Bienestar Mental
            <span className="block text-yellow-300">Es Nuestra Prioridad</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Registra tu estado de ánimo, conecta con psicólogos profesionales y recibe análisis 
            inteligente para mejorar tu bienestar mental día a día.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-lg"
            >
              Comenzar Ahora
            </Link>
            <Link
              to="/login"
              className="bg-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold text-lg border border-white/30"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Brain className="h-12 w-12 text-yellow-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Análisis con IA</h3>
            <p className="text-white/80">
              Recibe análisis inteligente de tus estados de ánimo con múltiples personalidades de IA especializadas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Users className="h-12 w-12 text-green-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Psicólogos Reales</h3>
            <p className="text-white/80">
              Conecta con psicólogos profesionales verificados para recibir apoyo personalizado.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Shield className="h-12 w-12 text-blue-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Detección de Crisis</h3>
            <p className="text-white/80">
              Sistema avanzado de detección de crisis que te conecta inmediatamente con ayuda profesional.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <BarChart3 className="h-12 w-12 text-purple-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Estadísticas Detalladas</h3>
            <p className="text-white/80">
              Visualiza tu progreso con gráficos y estadísticas que te ayudan a entender tus patrones.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <MessageCircle className="h-12 w-12 text-pink-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Chat Integrado</h3>
            <p className="text-white/80">
              Comunícate fácilmente con psicólogos o IA a través de nuestro sistema de chat integrado.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Calendar className="h-12 w-12 text-orange-300 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Gestión de Citas</h3>
            <p className="text-white/80">
              Programa y gestiona tus citas con psicólogos de manera fácil y organizada.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <Star className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para Transformar tu Bienestar Mental?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están mejorando su bienestar mental con nuestra plataforma.
          </p>
          <Link
            to="/register"
            className="bg-white text-purple-600 px-8 py-4 rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-lg inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-lg border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-white" />
              <span className="text-white font-semibold">MOOD LOG</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-white/80 hover:text-white transition-colors">
                Términos
              </Link>
              <Link to="/privacy" className="text-white/80 hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link to="/login" className="text-white/80 hover:text-white transition-colors">
                Soporte
              </Link>
            </div>
          </div>
          <div className="text-center text-white/60 mt-4">
            <p>&copy; 2025 Mood Log App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
