import { Calendar, Heart, Plus, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMood } from '../hooks/useMood';
import MoodEditModal from './MoodEditModal';
import MoodHistoryCard from './MoodHistoryCard';

interface MoodHistoryPanelProps {
  isDarkMode?: boolean;
}

const MoodHistoryPanel: React.FC<MoodHistoryPanelProps> = ({ isDarkMode = false }) => {
  const navigate = useNavigate();
  const { moodLogs, loading, updateMoodLog } = useMood();
  const [showAll, setShowAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMoodLog, setSelectedMoodLog] = useState<any>(null);

  // Aplicar modo oscuro al contenedor principal
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Ordenar logs por fecha (más recientes primero)
  const sortedMoodLogs = [...moodLogs].sort((a, b) => {
    try {
      const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' 
        ? a.createdAt.toDate() 
        : new Date(a.createdAt);
      const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' 
        ? b.createdAt.toDate() 
        : new Date(b.createdAt);
      
      // Verificar que las fechas son válidas
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error sorting mood logs:', error);
      return 0;
    }
  });

  // Mostrar solo los primeros 6 o todos según el estado
  const displayedLogs = showAll ? sortedMoodLogs : sortedMoodLogs.slice(0, 6);

  const handleAddMood = () => {
    navigate('/mood-flow');
  };

  const handleViewAll = () => {
    navigate('/statistics');
  };

  const handleEditMood = (moodLog: any) => {
    setSelectedMoodLog(moodLog);
    setShowEditModal(true);
  };

  const handleSaveMood = async (updatedMoodLog: any) => {
    try {
      await updateMoodLog(updatedMoodLog.id, updatedMoodLog);
      setShowEditModal(false);
      setSelectedMoodLog(null);
    } catch (error) {
      console.error('Error updating mood log:', error);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedMoodLog(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Estados de Ánimo
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border animate-pulse ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedMoodLogs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Estados de Ánimo
          </h3>
        </div>
        
        <div className={`p-8 rounded-lg border-2 border-dashed text-center ${
          isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
        }`}>
          <Heart className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No hay estados de ánimo registrados
          </h4>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Comienza a registrar tus estados de ánimo para ver tu historial aquí
          </p>
          <button
            onClick={handleAddMood}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Estado de Ánimo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-purple-600' : 'bg-purple-100'
          }`}>
            <Heart className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Historial de Estados de Ánimo
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {sortedMoodLogs.length} registro{sortedMoodLogs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddMood}
            className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Nuevo
          </button>
          
          {sortedMoodLogs.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showAll ? 'Ver menos' : 'Ver todos'}
            </button>
          )}
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedLogs.map((moodLog) => (
          <MoodHistoryCard
            key={moodLog.id}
            moodLog={moodLog}
            isDarkMode={isDarkMode}
            onEdit={handleEditMood}
          />
        ))}
      </div>

      {/* Botón para ver estadísticas completas */}
      {sortedMoodLogs.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={handleViewAll}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ver Estadísticas Completas</span>
          </button>
        </div>
      )}

      {/* Modal de edición */}
      <MoodEditModal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        moodLog={selectedMoodLog}
        onSave={handleSaveMood}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default MoodHistoryPanel;
