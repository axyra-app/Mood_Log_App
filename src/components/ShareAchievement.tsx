// Share Achievement Component
import { Copy, Share2, X } from 'lucide-react';
import { useState } from 'react';

interface ShareAchievementProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  };
  onClose: () => void;
}

const ShareAchievement = ({ achievement, onClose }: ShareAchievementProps) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 ¡Acabo de desbloquear el logro "${achievement.title}" en mi app de bienestar mental! ${achievement.description} #BienestarMental #Logros`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Logro desbloqueado: ${achievement.title}`,
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl p-6 max-w-md w-full'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>¡Comparte tu logro!</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='text-center mb-6'>
          <div className='text-4xl mb-3'>{achievement.icon}</div>
          <h4 className='text-xl font-bold text-gray-900 mb-2'>{achievement.title}</h4>
          <p className='text-gray-600 text-sm'>{achievement.description}</p>
          <p className='text-xs text-gray-500 mt-2'>
            Desbloqueado el {achievement.unlockedAt.toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className='bg-gray-50 rounded-lg p-3 mb-4'>
          <p className='text-sm text-gray-700'>{shareText}</p>
        </div>

        <div className='flex space-x-3'>
          <button
            onClick={handleNativeShare}
            className='flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors'
          >
            <Share2 className='w-4 h-4' />
            <span>Compartir</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Copy className='w-4 h-4' />
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareAchievement;
