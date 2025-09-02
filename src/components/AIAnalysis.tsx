// AI Analysis Component - Shows AI emotion analysis results
import { AlertCircle, Brain, CheckCircle, XCircle } from 'lucide-react';

interface AIAnalysisProps {
  analysis: {
    emotion: string;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    canConclude: boolean;
  };
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const AIAnalysis = ({ analysis, onAccept, onReject, isLoading = false }: AIAnalysisProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'Positivo';
      case 'negative':
        return 'Negativo';
      default:
        return 'Neutral';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
      <div className='text-center mb-6'>
        <div className='flex items-center justify-center space-x-2 mb-2'>
          <Brain className='w-6 h-6 text-primary-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Análisis de IA</h3>
        </div>
        <p className='text-gray-600'>Hemos analizado tu entrada de diario</p>
      </div>

      <div className='bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Emoción Detectada</p>
            <p className='font-semibold text-gray-900'>{analysis.emotion}</p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Confianza</p>
            <p className={`font-semibold ${getConfidenceColor(analysis.confidence)}`}>{analysis.confidence}%</p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-1'>Sentimiento</p>
            <p className={`font-semibold ${getSentimentColor(analysis.sentiment)}`}>
              {getSentimentLabel(analysis.sentiment)}
            </p>
          </div>
        </div>
      </div>

      {analysis.canConclude ? (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center space-x-2'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            <p className='text-green-800 font-medium'>La IA puede determinar tu estado de ánimo con confianza</p>
          </div>
        </div>
      ) : (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center space-x-2'>
            <AlertCircle className='w-5 h-5 text-yellow-600' />
            <p className='text-yellow-800 font-medium'>
              La IA no puede determinar tu estado de ánimo con suficiente confianza
            </p>
          </div>
        </div>
      )}

      <div className='flex justify-center space-x-4'>
        <button
          type='button'
          onClick={onAccept}
          disabled={isLoading}
          className='flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <CheckCircle className='w-4 h-4' />
          <span>Aceptar Análisis</span>
        </button>

        <button
          type='button'
          onClick={onReject}
          disabled={isLoading}
          className='flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <XCircle className='w-4 h-4' />
          <span>Necesito Ayuda</span>
        </button>
      </div>
    </div>
  );
};

export default AIAnalysis;
