// Mood Summary Component - Shows final mood registration summary
import { Brain, Calendar, CheckCircle, User } from 'lucide-react';

interface MoodSummaryProps {
  diaryEntry: {
    text: string;
    timestamp: Date;
    finalMood: number;
    hasExplicitMood: boolean;
    aiAnalysis?: {
      emotion: string;
      confidence: number;
      sentiment: 'positive' | 'negative' | 'neutral';
    };
  };
  onSave: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

const MoodSummary = ({ diaryEntry, onSave, onEdit, isLoading = false }: MoodSummaryProps) => {
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];
  const moodColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
      <div className='text-center mb-6'>
        <div className='flex items-center justify-center space-x-2 mb-2'>
          <CheckCircle className='w-6 h-6 text-green-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Resumen de tu Estado de Ánimo</h3>
        </div>
        <p className='text-gray-600'>Revisa la información antes de guardar</p>
      </div>

      <div className='space-y-4 mb-6'>
        {/* Date and Time */}
        <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
          <Calendar className='w-5 h-5 text-gray-600' />
          <div>
            <p className='text-sm text-gray-600'>Fecha y Hora</p>
            <p className='font-medium text-gray-900'>{formatDate(diaryEntry.timestamp)}</p>
          </div>
        </div>

        {/* Mood Score */}
        <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              moodColors[diaryEntry.finalMood - 1]
            }`}
          >
            {moodEmojis[diaryEntry.finalMood - 1]}
          </div>
          <div>
            <p className='text-sm text-gray-600'>Estado de Ánimo</p>
            <p className='font-medium text-gray-900'>
              {moodLabels[diaryEntry.finalMood - 1]} ({diaryEntry.finalMood}/5)
            </p>
          </div>
        </div>

        {/* Source */}
        <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
          {diaryEntry.hasExplicitMood ? (
            <User className='w-5 h-5 text-blue-600' />
          ) : (
            <Brain className='w-5 h-5 text-purple-600' />
          )}
          <div>
            <p className='text-sm text-gray-600'>Fuente</p>
            <p className='font-medium text-gray-900'>
              {diaryEntry.hasExplicitMood ? 'Selección Manual' : 'Análisis de IA'}
            </p>
          </div>
        </div>

        {/* AI Analysis Details */}
        {diaryEntry.aiAnalysis && !diaryEntry.hasExplicitMood && (
          <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <p className='text-sm text-purple-600 mb-2'>Detalles del Análisis de IA</p>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-gray-600'>Emoción:</span>
                <span className='ml-2 font-medium text-gray-900'>{diaryEntry.aiAnalysis.emotion}</span>
              </div>
              <div>
                <span className='text-gray-600'>Confianza:</span>
                <span className='ml-2 font-medium text-gray-900'>{diaryEntry.aiAnalysis.confidence}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Diary Entry Preview */}
        <div className='p-3 bg-gray-50 rounded-lg'>
          <p className='text-sm text-gray-600 mb-2'>Entrada de Diario</p>
          <p className='text-gray-900 text-sm leading-relaxed'>
            {diaryEntry.text.length > 100 ? `${diaryEntry.text.substring(0, 100)}...` : diaryEntry.text}
          </p>
        </div>
      </div>

      <div className='flex justify-center space-x-4'>
        <button
          type='button'
          onClick={onEdit}
          disabled={isLoading}
          className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Editar
        </button>

        <button
          type='button'
          onClick={onSave}
          disabled={isLoading}
          className='flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <CheckCircle className='w-4 h-4' />
          <span>Guardar Estado de Ánimo</span>
        </button>
      </div>
    </div>
  );
};

export default MoodSummary;
