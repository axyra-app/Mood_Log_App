import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
  Heart,
  MessageCircle,
  Shield,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 safe-area-top'>
        <div className='max-w-7xl mx-auto mobile-padding'>
          <div className='flex justify-between items-center py-4 sm:py-6'>
            <div className='flex items-center space-x-3'>
              <Logo size='lg' />
            </div>
            <div className='flex space-x-3 sm:space-x-4'>
              <Link
                to='/login'
                className='touch-target text-gray-600 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base font-medium'
              >
                <span className='hidden sm:inline'>Iniciar Sesión</span>
                <span className='sm:hidden'>Entrar</span>
              </Link>
              <Link
                to='/register'
                className='touch-target bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm sm:text-base shadow-sm'
              >
                <span className='hidden sm:inline'>Registrarse</span>
                <span className='sm:hidden'>Registro</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='max-w-7xl mx-auto mobile-padding py-8 sm:py-12 lg:py-16'>
        <div className='text-center mb-8 sm:mb-12 lg:mb-16'>
          <div className='inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6'>
            <Star className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
            Revolución Emocional
          </div>

          <h1 className='mobile-heading sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight'>
            Tu
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'>
              Transformación
            </span>
            <br />
            Emocional
          </h1>

          <p className='mobile-text lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto px-4'>
            La plataforma más completa para el bienestar mental.
            <br className='hidden sm:block' />
            <span className='sm:hidden'> </span>
            IA avanzada, psicólogos profesionales, seguimiento personalizado y detección de crisis en tiempo real.
          </p>

          <div className='mobile-flex justify-center px-4'>
            <Link
              to='/register'
              className='touch-target bg-purple-600 text-white mobile-button rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold inline-flex items-center justify-center'
            >
              Comenzar Ahora
              <ArrowRight className='ml-2 h-4 w-4 sm:h-5 sm:w-5' />
            </Link>
            <Link
              to='/login'
              className='touch-target border-2 border-purple-600 text-purple-600 mobile-button rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold'
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Features Grid - Para Usuarios */}
        <div className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8'>
            Para <span className='text-purple-600'>Usuarios</span>
          </h2>
          <div className='mobile-grid lg:gap-8'>
            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Brain className='h-5 w-5 sm:h-6 sm:w-6 text-yellow-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>IA Avanzada</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Análisis inteligente de emociones con múltiples personalidades de IA especializadas.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Users className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Psicólogos Profesionales</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Conecta con psicólogos verificados para recibir apoyo personalizado y profesional.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Shield className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Detección de Crisis</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Sistema avanzado que detecta crisis y te conecta inmediatamente con ayuda profesional.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <BarChart3 className='h-5 w-5 sm:h-6 sm:w-6 text-purple-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Estadísticas Detalladas</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Visualiza tu progreso con gráficos avanzados y análisis de patrones emocionales.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <MessageCircle className='h-5 w-5 sm:h-6 sm:w-6 text-pink-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Chat Integrado</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Comunícate fácilmente con psicólogos o IA a través de nuestro sistema de chat en tiempo real.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Calendar className='h-5 w-5 sm:h-6 sm:w-6 text-orange-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Gestión de Citas</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Programa y gestiona tus citas con psicólogos de manera fácil y organizada.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <FileText className='h-5 w-5 sm:h-6 sm:w-6 text-indigo-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Diario Personal</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Registra tus pensamientos y emociones en un diario privado con análisis automático.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Bell className='h-5 w-5 sm:h-6 sm:w-6 text-teal-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>
                Recordatorios Inteligentes
              </h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Recibe recordatorios personalizados para mantener tu bienestar mental.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Heart className='h-5 w-5 sm:h-6 sm:w-6 text-red-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>
                Seguimiento de Estado de Ánimo
              </h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Registra y analiza tu estado de ánimo diario con herramientas avanzadas de seguimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid - Para Psicólogos */}
        <div className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8'>
            Para <span className='text-blue-600'>Psicólogos</span>
          </h2>
          <div className='mobile-grid lg:gap-8'>
            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <UserCheck className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Gestión de Pacientes</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Administra tus pacientes con herramientas profesionales de seguimiento y análisis.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <TrendingUp className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Estadísticas de Pacientes</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Visualiza el progreso de tus pacientes con gráficos detallados y reportes automáticos.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <MessageCircle className='h-5 w-5 sm:h-6 sm:w-6 text-purple-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Chat con Pacientes</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Comunícate con tus pacientes a través de nuestro sistema de chat seguro y profesional.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Calendar className='h-5 w-5 sm:h-6 sm:w-6 text-orange-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Gestión de Citas</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Programa y gestiona tus citas con pacientes de manera eficiente y organizada.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Shield className='h-5 w-5 sm:h-6 sm:w-6 text-red-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Alertas de Crisis</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Recibe alertas inmediatas cuando tus pacientes necesiten atención urgente.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <FileText className='h-5 w-5 sm:h-6 sm:w-6 text-indigo-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Notas de Sesión</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Registra notas de sesión y planes de tratamiento de manera organizada y segura.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid - Tecnología */}
        <div className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8'>
            <span className='text-green-600'>Tecnología</span> Avanzada
          </h2>
          <div className='mobile-grid lg:gap-8'>
            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Zap className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>IA de Última Generación</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Tecnología de inteligencia artificial avanzada para análisis emocional preciso.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Smartphone className='h-5 w-5 sm:h-6 sm:w-6 text-blue-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Multiplataforma</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Accede desde cualquier dispositivo: web, móvil, tablet. Siempre sincronizado.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Globe className='h-5 w-5 sm:h-6 sm:w-6 text-purple-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Acceso Global</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Disponible en múltiples idiomas y zonas horarias para usuarios de todo el mundo.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Target className='h-5 w-5 sm:h-6 sm:w-6 text-yellow-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Precisión Milimétrica</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Análisis emocional con precisión científica para resultados confiables y efectivos.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <Award className='h-5 w-5 sm:h-6 sm:w-6 text-red-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Certificaciones</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Plataforma certificada y validada por profesionales de la salud mental.
              </p>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl mobile-card hover:shadow-lg transition-shadow'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4'>
                <CheckCircle className='h-5 w-5 sm:h-6 sm:w-6 text-teal-600' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3'>Privacidad Garantizada</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Cumplimiento total con regulaciones de privacidad y seguridad de datos médicos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white'>
          <Star className='h-12 w-12 sm:h-16 sm:w-16 text-yellow-300 mx-auto mb-4 sm:mb-6' />
          <h2 className='text-2xl sm:text-3xl font-bold mb-3 sm:mb-4'>¿Listo para Transformar tu Bienestar Mental?</h2>
          <p className='text-purple-100 mb-6 sm:mb-8 max-w-3xl mx-auto text-sm sm:text-base'>
            Únete a miles de usuarios y psicólogos que ya están mejorando el bienestar mental con nuestra plataforma
            integral.
            <br className='hidden sm:block' />
            <span className='sm:hidden'> </span>
            IA avanzada, profesionales verificados y tecnología de última generación.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
            <Link
              to='/register'
              className='bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-base sm:text-lg inline-flex items-center justify-center'
            >
              Crear Cuenta Gratis
              <ArrowRight className='ml-2 h-4 w-4 sm:h-5 sm:w-5' />
            </Link>
            <Link
              to='/register'
              className='border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-200 font-semibold text-base sm:text-lg inline-flex items-center justify-center'
            >
              Soy Psicólogo
              <UserCheck className='ml-2 h-4 w-4 sm:h-5 sm:w-5' />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-200 mt-8 sm:mt-12 lg:mt-16 safe-area-bottom'>
        <div className='max-w-7xl mx-auto mobile-padding py-6 sm:py-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center space-x-2 mb-4 md:mb-0'>
              <Logo size='sm' />
            </div>
            <div className='flex space-x-4 sm:space-x-6'>
              <Link to='/terms' className='text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base'>
                Términos
              </Link>
              <Link to='/privacy' className='text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base'>
                Privacidad
              </Link>
              <Link to='/login' className='text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base'>
                Soporte
              </Link>
            </div>
          </div>
          <div className='text-center text-gray-500 mt-4 text-xs sm:text-sm'>
            <p>&copy; 2025 Mood Log App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
