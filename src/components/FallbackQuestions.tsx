// Fallback Questions Component - For when AI can't determine mood
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

interface FallbackQuestionsProps {
  questions: string[];
  currentQuestionIndex: number;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onComplete: () => void;
  isLoading?: boolean;
  motivationalMessage?: string;
}

const FallbackQuestions = ({
  questions,
  currentQuestionIndex,
  onAnswer,
  onPrevious,
  onComplete,
  isLoading = false,
  motivationalMessage,
}: FallbackQuestionsProps) => {
  const [currentAnswer, setCurrentAnswer] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoNext = currentAnswer.trim().length > 0;

  const handleAnswer = () => {
    if (canGoNext) {
      onAnswer(currentAnswer);
      setCurrentAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canGoNext) {
      handleAnswer();
    }
  };

  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
      {motivationalMessage && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <p className='text-blue-800 text-sm font-medium'>{motivationalMessage}</p>
        </div>
      )}

      <div className='text-center mb-6'>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Ayúdanos a entender mejor cómo te sientes</h3>
        <p className='text-gray-600'>
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>

      <div className='mb-6'>
        <p className='text-lg font-medium text-gray-700 mb-4 text-center'>{currentQuestion}</p>

        <div className='max-w-md mx-auto'>
          <input
            type='text'
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Tu respuesta...'
            disabled={isLoading}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg'
            autoFocus
          />
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <button
          type='button'
          onClick={onPrevious}
          disabled={isLoading || currentQuestionIndex === 0}
          className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Anterior</span>
        </button>

        <div className='flex space-x-2'>
          {Array.from({ length: questions.length }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${index <= currentQuestionIndex ? 'bg-primary-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        <button
          type='button'
          onClick={isLastQuestion ? onComplete : handleAnswer}
          disabled={isLoading || !canGoNext}
          className='flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLastQuestion ? (
            <>
              <Check className='w-4 h-4' />
              <span>Completar</span>
            </>
          ) : (
            <>
              <span>Siguiente</span>
              <ArrowRight className='w-4 h-4' />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FallbackQuestions;
