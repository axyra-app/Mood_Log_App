import { Calendar, Edit, Heart, Smile, TrendingUp } from 'lucide-react';
import React from 'react';

interface MoodLog {
  id: string;
  mood: number;
  energy?: number;
  stress?: number;
  sleep?: number;
  notes?: string;
  createdAt: Date;
  date?: Date;
}

interface MoodHistoryCardProps {
  moodLog: MoodLog;
  isDarkMode?: boolean;
  onEdit?: (moodLog: MoodLog) => void;
}

const MoodHistoryCard: React.FC<MoodHistoryCardProps> = ({ moodLog, isDarkMode = false, onEdit }) => {

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return '😊';
    if (mood >= 7) return '🙂';
    if (mood >= 5) return '😐';
    if (mood >= 3) return '😔';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 9) return 'text-green-600';
    if (mood >= 7) return 'text-blue-600';
    if (mood >= 5) return 'text-yellow-600';
    if (mood >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMoodBackground = (mood: number) => {
    if (mood >= 9) return isDarkMode ? 'bg-green-900/30' : 'bg-green-50';
    if (mood >= 7) return isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
    if (mood >= 5) return isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50';
    if (mood >= 3) return isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50';
    return isDarkMode ? 'bg-red-900/30' : 'bg-red-50';
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(moodLog);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border hover:shadow-md transition-all duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      {/* Header con fecha y hora */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {formatDate(moodLog.date || moodLog.createdAt)}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatTime(moodLog.createdAt)}
          </span>
        </div>
        <button
          onClick={handleEditClick}
          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Editar estado de ánimo"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Estado de ánimo principal */}
      <div className={`p-3 rounded-lg mb-3 ${getMoodBackground(moodLog.mood)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getMoodEmoji(moodLog.mood)}</span>
            <div>
              <div className={`text-lg font-semibold ${getMoodColor(moodLog.mood)}`}>
                {moodLog.mood}/10
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Estado de ánimo
              </div>
            </div>
          </div>
          <Heart className={`w-5 h-5 ${getMoodColor(moodLog.mood)}`} />
        </div>
      </div>

      {/* Métricas adicionales */}
      {(moodLog.energy || moodLog.stress || moodLog.sleep) && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {moodLog.energy && (
            <div className="text-center">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {moodLog.energy}/10
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Energía
              </div>
            </div>
          )}
          {moodLog.stress && (
            <div className="text-center">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {moodLog.stress}/10
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Estrés
              </div>
            </div>
          )}
          {moodLog.sleep && (
            <div className="text-center">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {moodLog.sleep}/10
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sueño
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas si las hay */}
      {moodLog.notes && (
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
          {moodLog.notes.length > 100 
            ? moodLog.notes.substring(0, 100) + '...' 
            : moodLog.notes
          }
        </div>
      )}

      {/* Indicador de tendencia */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-1">
          <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Haz clic en el botón editar
          </span>
        </div>
        <Smile className={`w-4 h-4 ${getMoodColor(moodLog.mood)}`} />
      </div>
    </div>
  );
};

export default MoodHistoryCard;
