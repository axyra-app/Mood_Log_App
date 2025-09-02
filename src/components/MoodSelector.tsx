// Mood Selector Component - For explicit mood selection
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface MoodSelectorProps {
  onMoodSelect: (mood: number) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const MoodSelector = ({ onMoodSelect, onSkip, isLoading = false }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];
  const moodColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>¿Cómo te sientes hoy?</h3>
        <p className='text-gray-600'>Selecciona tu estado de ánimo actual</p>
      </div>

      <div className='flex justify-center space-x-4 mb-6'>
        {moodEmojis.map((emoji, index) => (
          <button
            key={index}
            type='button'
            onClick={() => handleMoodSelect(index + 1)}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 transform hover:scale-110 ${
              selectedMood === index + 1
                ? `${moodColors[index]} text-white shadow-lg scale-110`
                : 'bg-gray-100 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className='text-center mb-4'>
          <p className='text-lg font-medium text-gray-700'>{moodLabels[selectedMood - 1]}</p>
        </div>
      )}

      <div className='flex justify-center space-x-3'>
        <button
          type='button'
          onClick={onSkip}
          disabled={isLoading}
          className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
        >
          <X className='w-4 h-4' />
          <span>Omitir</span>
        </button>

        {selectedMood && (
          <button
            type='button'
            onClick={() => onMoodSelect(selectedMood)}
            disabled={isLoading}
            className='flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors'
          >
            <Check className='w-4 h-4' />
            <span>Confirmar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MoodSelector;
