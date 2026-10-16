import { ArrowRight, Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ChatSelection: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-gray-900'
      }`}
    >
      <Header
        title='MIA'
        subtitle='Un espacio de autorreflexión para acompañar tu estado de ánimo'
        backTo='/dashboard'
        backLabel='Volver al Dashboard'
      />

      <main className='mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16'>
        <div className='mx-auto max-w-2xl text-center'>
          <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'>
            <Heart className='h-8 w-8' aria-hidden='true' />
          </div>
          <p className='mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300'>Tu espacio emocional</p>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            Hola, {user?.displayName || '¿cómo estás?'}
          </h2>
          <p className={`mx-auto mt-4 max-w-xl text-base leading-7 sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            MIA puede escucharte sin juzgar y ayudarte a poner en palabras cómo te sientes. No tienes que tener todo claro para empezar.
          </p>
        </div>

        <section
          className={`mx-auto mt-9 max-w-2xl overflow-hidden rounded-3xl border shadow-xl ${
            isDarkMode ? 'border-gray-800 bg-gray-900 shadow-black/20' : 'border-violet-100 bg-white shadow-violet-950/5'
          }`}
        >
          <div className='bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-6 text-white sm:px-8'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25'>
                <MessageCircle className='h-6 w-6' aria-hidden='true' />
              </div>
              <div>
                <h3 className='text-xl font-bold'>Habla con MIA</h3>
                <p className='mt-1 text-sm text-white/85'>Una conversación breve, a tu ritmo.</p>
              </div>
            </div>
          </div>

          <div className='px-6 py-6 sm:px-8 sm:py-8'>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <Heart className='mt-0.5 h-5 w-5 shrink-0 text-fuchsia-500' aria-hidden='true' />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  Explora tu ánimo y las emociones que estás sintiendo.
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <Sparkles className='mt-0.5 h-5 w-5 shrink-0 text-violet-500' aria-hidden='true' />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  Encuentra una pregunta o un pequeño paso que te sirva hoy.
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-emerald-500' aria-hidden='true' />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  Conversa sin presión: puedes compartir solo lo que quieras.
                </span>
              </li>
            </ul>

            <button
              type='button'
              onClick={() => navigate('/chat/assistant/mia')}
              className='mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-violet-600/20 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300'
            >
              <span>Hablar con MIA</span>
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </button>
          </div>
        </section>

        <aside
          className={`mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${
            isDarkMode ? 'border-gray-800 bg-gray-900/70 text-gray-400' : 'border-gray-200 bg-white/80 text-gray-600'
          }`}
        >
          <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-violet-500' aria-hidden='true' />
          <p>
            MIA es una IA para autorreflexión, no atención clínica ni un servicio de emergencia. Tus mensajes se envían a Groq para generar respuestas y no se guardan como historial en Mood Log. Evita compartir información que no quieras enviar a un proveedor externo. Si existe peligro inmediato, contacta los servicios de emergencia locales o a una persona de confianza.
          </p>
        </aside>
      </main>
    </div>
  );
};

export default ChatSelection;
