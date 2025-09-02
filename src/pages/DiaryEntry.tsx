// Diary Entry Page - Initial diary text input
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryValidation from '../components/DiaryValidation';
import { useAutoSave } from '../hooks/useAutoSave';
import { analyticsService } from '../services/analyticsService';

const DiaryEntry = () => {
  const [diaryText, setDiaryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Auto-save functionality
  const { save: autoSave } = useAutoSave({
    value: diaryText,
    delay: 3000, // Save after 3 seconds of inactivity
    onSave: (value) => {
      if (value.trim().length >= 10) {
        localStorage.setItem('diary_draft', value);
        setLastSaved(new Date());
      }
    },
    enabled: diaryText.trim().length >= 10,
  });

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('diary_draft');
    if (draft) {
      setDiaryText(draft);
      setLastSaved(new Date(localStorage.getItem('diary_draft_timestamp') || ''));
    }

    // Track page view
    analyticsService.trackPageView('diary_entry');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (diaryText.trim().length < 10) {
      setErrorMessage('Por favor, escribe al menos 10 caracteres sobre tu día.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Track diary submission
      analyticsService.trackDiaryEvent('submit', {
        textLength: diaryText.trim().length,
        hasDraft: !!localStorage.getItem('diary_draft'),
      });

      // Clear draft when submitting
      localStorage.removeItem('diary_draft');
      localStorage.removeItem('diary_draft_timestamp');

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to mood flow page with diary text
      navigate('/mood-flow', {
        state: { diaryText: diaryText.trim() },
        replace: true
      });
    } catch (error) {
      console.error('Error processing diary entry:', error);
      setErrorMessage('Error al procesar tu entrada. Inténtalo de nuevo.');

      // Track error
      analyticsService.trackError('diary_submission_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header with back button */}
        <div className='flex items-center justify-between mb-4 sm:mb-8'>
          <button
            onClick={() => navigate('/dashboard')}
            className='flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm sm:text-base'
          >
            <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
            <span className='hidden sm:inline'>Volver al Dashboard</span>
            <span className='sm:hidden'>Volver</span>
          </button>
        </div>

        {/* Title Section */}
        <div className='text-center mb-6 sm:mb-8'>
          <div className='flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center'>
              <FileText className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Mi Diario</h1>
          </div>
          <p className='text-base sm:text-lg text-gray-600 max-w-md mx-auto px-4'>
            Cuéntanos sobre tu día. Comparte lo que te ha pasado, cómo te sientes, qué has hecho...
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs'>!</span>
              </div>
              <p className='text-red-800 font-medium'>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Diary Entry Form */}
        <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
          <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl border border-gray-200'>
            <div className='mb-4 sm:mb-6'>
              <label htmlFor='diary-text' className='block text-sm font-medium text-gray-700 mb-2 sm:mb-3'>
                ¿Cómo ha sido tu día?
              </label>
              <textarea
                id='diary-text'
                value={diaryText}
                onChange={(e) => setDiaryText(e.target.value)}
                className='w-full h-48 sm:h-64 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-gray-900 placeholder-gray-500 text-sm sm:text-base'
                placeholder='Escribe libremente sobre tu día... ¿Qué has hecho? ¿Cómo te sientes? ¿Qué te ha pasado? No hay reglas, solo sé tú mismo.'
                maxLength={1000}
              />
              <div className='mt-3'>
                <DiaryValidation text={diaryText} minLength={10} maxLength={1000} />

                {/* Auto-save indicator */}
                {lastSaved && diaryText.trim().length >= 10 && (
                  <div className='mt-2 flex items-center space-x-2 text-xs text-gray-500'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                    <span>Guardado automático: {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='text-sm font-medium text-blue-900 mb-2'>💡 Consejos para escribir tu diario:</h3>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• No te preocupes por la gramática o el estilo</li>
                <li>• Escribe como si estuvieras hablando con un amigo</li>
                <li>• Incluye tanto los momentos buenos como los difíciles</li>
                <li>• Menciona actividades, personas o eventos importantes</li>
              </ul>
            </div>

                         {/* Action Buttons */}
             <div className='space-y-3'>
               <button
                 type='submit'
                 disabled={diaryText.trim().length < 10 || isLoading}
                 className='w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg font-semibold'
               >
                 {isLoading ? (
                   <div className='flex items-center justify-center space-x-3'>
                     <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                     <span>Procesando...</span>
                   </div>
                 ) : (
                   <div className='flex items-center justify-center space-x-3'>
                     <Send className='w-5 h-5' />
                     <span>Continuar con mi Estado de Ánimo</span>
                   </div>
                 )}
               </button>
               
               <button
                 type='button'
                 onClick={() => navigate('/dashboard')}
                 className='w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium'
               >
                 Seguir sin registrar diario
               </button>
             </div>
          </div>
        </form>

        {/* Footer */}
        <div className='text-center mt-8'>
          <p className='text-sm text-gray-500'>
            Después de escribir tu diario, te ayudaremos a registrar cómo te sientes
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntry;
