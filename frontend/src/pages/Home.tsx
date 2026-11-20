import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Heart,
  MessageCircle,
  Moon,
  Shield,
  Sparkles,
  Sun,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const Home: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className='min-h-screen mood-canvas'>
      {/* Header */}
      <header className='mood-header shadow-sm border-b border-gray-100 sticky top-0 z-50 safe-area-top'>
        <div className='max-w-7xl mx-auto mobile-padding'>
          <div className='flex justify-between items-center py-4 sm:py-5'>
            <div className='flex items-center space-x-3'>
              <Logo size='md' className='home-brand' />
            </div>
            <div className='flex items-center gap-1 sm:gap-4'>
              <button
                type='button'
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className='touch-target rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'
              >
                {isDarkMode ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
              </button>
              <Link
                to='/login'
                className='touch-target text-gray-600 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base font-medium'
              >
                <span className='hidden sm:inline'>Iniciar Sesión</span>
                <span className='sm:hidden'>Entrar</span>
              </Link>
              <Link
                to='/register'
                className='touch-target brand-gradient text-[#101414] px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl transition-all font-semibold text-xs sm:text-base shadow-sm whitespace-nowrap'
              >
                <span className='hidden sm:inline'>Comenzar Gratis</span>
                <span className='sm:hidden'>Crear cuenta</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='max-w-7xl mx-auto mobile-padding py-10 sm:py-16 lg:py-20'>
        <div className='text-center mb-12 sm:mb-16'>
          <div className='inline-flex items-center px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-sm'>
            <Sparkles className='h-4 w-4 mr-2 text-purple-600' />
            Un espacio para la autorreflexión diaria
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight'>
            Registra, explora y reflexiona sobre <br className='hidden sm:block' />
            <span className='text-transparent bg-clip-text brand-gradient'>
              tu estado de ánimo
            </span>
          </h1>

          <p className='text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4 leading-relaxed'>
            Registra tu ánimo y lo que quieras anotar en tu diario, revisa resúmenes de tus registros y usa una IA opcional para autorreflexión.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center px-4'>
            <Link
              to='/register'
              className='w-full sm:w-auto brand-gradient text-[#101414] px-8 py-4 rounded-xl transition-all duration-200 font-bold text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl'
            >
              Comenzar Ahora
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
            <Link
              to='/login'
              className='w-full sm:w-auto border-2 border-gray-200 text-gray-700 hover:border-purple-600 hover:text-purple-600 px-8 py-4 rounded-xl transition-all duration-200 font-semibold text-lg'
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Pilares Clave */}
        <div className='mb-20'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-3'>
              Diseñado para ser tu <span className='text-purple-600'>compañero diario</span>
            </h2>
            <p className='text-gray-600 max-w-xl mx-auto'>
              Herramientas para registrar cómo te sientes y revisar tus propias observaciones.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Card 1 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5 text-purple-600'>
                <Heart className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Registro rápido</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Registra cómo te sientes al instante. Sin formularios engorrosos: una escala intuitiva de ánimo, emociones y notas rápidas.
              </p>
            </div>

            {/* Card 2 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-[#fff0cf] rounded-xl flex items-center justify-center mb-5 text-[#8d5b00]'>
                <BarChart3 className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Tendencias descriptivas</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Revisa tus registros, promedios y cambios a lo largo del tiempo. Son resúmenes de lo que reportas; no explican causas ni predicen cómo te sentirás.
              </p>
            </div>

            {/* Card 3 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-[#ffe7ed] rounded-xl flex items-center justify-center mb-5 text-[#9f405e]'>
                <BookOpen className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Diario personal</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Escribe y consulta tus reflexiones desde tu cuenta. El diario se guarda en Firebase y no cuenta con cifrado de extremo a extremo.
              </p>
            </div>

            {/* Card 4 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-5 text-pink-600'>
                <MessageCircle className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Asistente de autorreflexión con IA</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Conversa para ordenar ideas y recibir preguntas para reflexionar. No ofrece diagnóstico ni atención profesional; las tareas que envían contenido a Groq requieren tu confirmación.
              </p>
            </div>

            {/* Card 5 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-[#ffe7ed] rounded-xl flex items-center justify-center mb-5 text-[#9f405e]'>
                <Activity className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Datos de salud en evaluación</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Mood Log aún no conecta relojes ni recopila pulsaciones. Una posible integración será opcional y presentará mediciones como contexto, sin deducir emociones o estrés.
              </p>
            </div>

            {/* Card 6 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 text-amber-600'>
                <Shield className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Control y transparencia</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Cuando autorizas guardar registros, se asocian a tu cuenta. Solo si solicitas una tarea de IA, Mood Log muestra qué contenido se enviará y pide una confirmación separada; guardar registros no los envía a Groq.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='brand-gradient rounded-3xl p-8 sm:p-12 text-center text-[#101414] shadow-xl'>
          <h2 className='text-3xl sm:text-4xl font-extrabold mb-4'>
            Empieza tu registro de ánimo
          </h2>
          <p className='text-[#101414]/80 mb-8 max-w-2xl mx-auto text-base sm:text-lg'>
            Registra cómo te sientes y revisa tus propias observaciones con el tiempo.
          </p>
          <div className='flex justify-center'>
            <Link
              to='/register'
              className='bg-[#101414] text-white px-8 py-4 rounded-xl hover:bg-[#222825] transition-all duration-200 font-bold text-lg inline-flex items-center shadow-lg hover:scale-105'
            >
              Crear Cuenta Gratis
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-200 mt-16 safe-area-bottom'>
        <div className='max-w-7xl mx-auto mobile-padding py-8'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='flex items-center space-x-2'>
              <Logo size='sm' />
            </div>
            <div className='flex space-x-6'>
              <Link to='/terms' className='text-gray-500 hover:text-gray-900 text-sm'>
                Términos
              </Link>
              <Link to='/privacy' className='text-gray-500 hover:text-gray-900 text-sm'>
                Privacidad
              </Link>
              <Link to='/login' className='text-gray-500 hover:text-gray-900 text-sm'>
                Iniciar Sesión
              </Link>
            </div>
          </div>
          <div className='text-center text-gray-500 mt-6 text-xs'>
            <p>&copy; 2026 Mood Log App. Registro y reflexión sobre tu ánimo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
