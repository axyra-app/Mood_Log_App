import { BarChart3, Brain, Calendar, Heart, MessageCircle, Shield, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import FirebaseTest from '../components/FirebaseTest';

const LandingPage = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <Heart className='w-6 h-6 text-white' />
              </div>
              <span className='text-2xl font-bold text-gradient'>Mood Log App</span>
            </div>
            <div className='flex items-center space-x-4'>
              <Link to='/login' className='text-gray-600 hover:text-primary-600 font-medium transition-colors'>
                Iniciar Sesión
              </Link>
              <Link to='/register' className='btn-primary'>
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>😊 Mood Log App</h1>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            Tu compañero personal para el seguimiento del estado de ánimo con inteligencia artificial. Conecta con
            psicólogos profesionales y mejora tu bienestar mental.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/register' className='btn-primary text-lg px-8 py-4'>
              Comenzar Ahora
            </Link>
            <Link to='/login' className='btn-secondary text-lg px-8 py-4'>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Firebase Test Section */}
      <section className='py-10 px-4 sm:px-6 lg:px-8'>
        <FirebaseTest />
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gradient-to-br from-primary-50 to-purple-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>Características Principales</h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Herramientas avanzadas para el seguimiento del estado de ánimo y conexión con profesionales
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-12'>
            {/* Para Usuarios */}
            <div className='space-y-6'>
              <h3 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                <Users className='w-8 h-8 text-primary-600 mr-3' />
                Para Usuarios
              </h3>

              <div className='space-y-4'>
                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Zap className='w-5 h-5 text-primary-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>PWA Instalable</h4>
                    <p className='text-gray-600'>Instala la app en tu dispositivo para acceso rápido y offline</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Brain className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>IA para Clasificación</h4>
                    <p className='text-gray-600'>Análisis automático de emociones con inteligencia artificial</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <BarChart3 className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Seguimiento de Patrones</h4>
                    <p className='text-gray-600'>Identifica tendencias y patrones en tu estado de ánimo</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <MessageCircle className='w-5 h-5 text-primary-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Chat con Psicólogos</h4>
                    <p className='text-gray-600'>Comunicación directa con profesionales de la salud mental</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Para Psicólogos */}
            <div className='space-y-6'>
              <h3 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                <Shield className='w-8 h-8 text-purple-600 mr-3' />
                Para Psicólogos
              </h3>

              <div className='space-y-4'>
                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Users className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Gestión de Pacientes</h4>
                    <p className='text-gray-600'>Administra y monitorea a tus pacientes de manera eficiente</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <BarChart3 className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Monitoreo en Tiempo Real</h4>
                    <p className='text-gray-600'>Seguimiento continuo del progreso de tus pacientes</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <MessageCircle className='w-5 h-5 text-primary-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Comunicación Directa</h4>
                    <p className='text-gray-600'>Chat integrado para comunicación inmediata con pacientes</p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100'>
                  <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Calendar className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Programación de Sesiones</h4>
                    <p className='text-gray-600'>Organiza y programa sesiones de terapia de manera eficiente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-primary-600 to-purple-600'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-white mb-6'>¿Listo para mejorar tu bienestar mental?</h2>
          <p className='text-xl text-primary-100 mb-8'>
            Únete a miles de usuarios que ya están transformando su vida con Mood Log App
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to='/register'
              className='bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to='/login'
              className='border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200'
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center space-x-2 mb-4 md:mb-0'>
              <div className='w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <Heart className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gradient'>Mood Log App</span>
            </div>
            <div className='text-center md:text-right'>
              <p className='text-gray-600 mb-2'>
                © 2025 Mood Log App. Todos los derechos reservados.
              </p>
              <Link 
                to='/terms' 
                className='text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors'
              >
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
