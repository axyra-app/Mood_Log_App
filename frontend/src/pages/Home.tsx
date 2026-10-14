import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 safe-area-top'>
        <div className='max-w-7xl mx-auto mobile-padding'>
          <div className='flex justify-between items-center py-4 sm:py-5'>
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
                className='touch-target bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm sm:text-base shadow-sm'
              >
                Comenzar Gratis
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
            El Strava de tu Bienestar Emocional
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight'>
            Mide, comprende y mejora <br className='hidden sm:block' />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600'>
              tu estado de ánimo
            </span>
          </h1>

          <p className='text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4 leading-relaxed'>
            Una experiencia diaria ágil para seguir tus emociones, construir rachas de bienestar, escribir en tu diario privado y conversar con un confidente personal con inteligencia artificial.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center px-4'>
            <Link
              to='/register'
              className='w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-bold text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl'
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
              Todo lo que necesitas para cuidar de tu mente de forma sencilla, visual y privada.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Card 1 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5 text-purple-600'>
                <Heart className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Registro en 5 segundos</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Registra cómo te sientes al instante. Sin formularios engorrosos: una escala intuitiva de ánimo, emociones y notas rápidas.
              </p>
            </div>

            {/* Card 2 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 text-blue-600'>
                <BarChart3 className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Métricas y Rachas estilo Strava</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Visualiza tus rachas de días consecutivos, promedios semanales y fluctuaciones para entender qué detona tus mejores días.
              </p>
            </div>

            {/* Card 3 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5 text-indigo-600'>
                <BookOpen className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Diario Personal Privado</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Documenta tus pensamientos y reflexiones en un espacio seguro. Tus datos están completamente aislados y protegidos.
              </p>
            </div>

            {/* Card 4 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-5 text-pink-600'>
                <MessageCircle className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Confidente Personal con IA</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Un espacio empático 24/7 para desahogarte, ordenar tus pensamientos y recibir preguntas reflexivas sin sentirte juzgado.
              </p>
            </div>

            {/* Card 5 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 text-emerald-600'>
                <Activity className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Futuro Biométrico</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Próximamente: conexión con pulsaciones y sensores de smartwatches para correlacionar picos de estrés físico con tu registro emocional.
              </p>
            </div>

            {/* Card 6 */}
            <div className='bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300'>
              <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 text-amber-600'>
                <Shield className='w-6 h-6' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Privacidad No Negociable</h3>
              <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
                Reglas de acceso cerradas: tus registros íntimos solo pueden ser leídos por ti. Tus datos no se comparten con terceros.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl'>
          <h2 className='text-3xl sm:text-4xl font-extrabold mb-4'>
            Empieza a cuidar de tu mente hoy mismo
          </h2>
          <p className='text-purple-100 mb-8 max-w-2xl mx-auto text-base sm:text-lg'>
            Únete a Mood Log y descubre el poder del autoconocimiento diario y las métricas de bienestar personal.
          </p>
          <div className='flex justify-center'>
            <Link
              to='/register'
              className='bg-white text-purple-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold text-lg inline-flex items-center shadow-lg hover:scale-105'
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
          <div className='text-center text-gray-400 mt-6 text-xs'>
            <p>&copy; 2026 Mood Log App. Tu bienestar emocional, cuantificado y seguro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
