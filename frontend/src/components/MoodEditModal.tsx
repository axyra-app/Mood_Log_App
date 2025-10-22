import { X, Save, Heart, Zap, AlertTriangle, Moon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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

interface MoodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  moodLog: MoodLog | null;
  onSave: (updatedMoodLog: MoodLog) => void;
  isDarkMode?: boolean;
}

const MoodEditModal: React.FC<MoodEditModalProps> = ({
  isOpen,
  onClose,
  moodLog,
  onSave,
  isDarkMode = false
}) => {
  const [formData, setFormData] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 5,
    notes: ''
  });

  useEffect(() => {
    if (moodLog) {
      setFormData({
        mood: moodLog.mood || 5,
        energy: moodLog.energy || 5,
        stress: moodLog.stress || 5,
        sleep: moodLog.sleep || 5,
        notes: moodLog.notes || ''
      });
    }
  }, [moodLog]);

  const handleSave = () => {
    if (!moodLog) return;

    const updatedMoodLog: MoodLog = {
      ...moodLog,
      mood: formData.mood,
      energy: formData.energy,
      stress: formData.stress,
      sleep: formData.sleep,
      notes: formData.notes
    };

    onSave(updatedMoodLog);
    toast.success('Estado de ánimo actualizado correctamente');
    onClose();
  };

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

  if (!isOpen || !moodLog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-purple-600' : 'bg-purple-100'
              }`}>
                <Heart className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Editar Estado de Ánimo
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Modifica los valores de tu registro
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado de ánimo principal */}
          <div className={`p-4 rounded-lg ${getMoodBackground(formData.mood)}`}>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{getMoodEmoji(formData.mood)}</span>
              <div>
                <h4 className={`text-lg font-semibold ${getMoodColor(formData.mood)}`}>
                  Estado de Ánimo: {formData.mood}/10
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ¿Cómo te sientes?
                </p>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #22c55e 75%, #16a34a 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>😢 Muy mal</span>
              <span>😊 Excelente</span>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Energía */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Energía
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy}
                onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.energy}/10
                </span>
              </div>
            </div>

            {/* Estrés */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estrés
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress}
                onChange={(e) => setFormData({ ...formData, stress: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.stress}/10
                </span>
              </div>
            </div>

            {/* Sueño */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Moon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sueño
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep}
                onChange={(e) => setFormData({ ...formData, sleep: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.sleep}/10
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="¿Hay algo más que quieras agregar sobre cómo te sientes?"
              className={`w-full p-3 rounded-lg border resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodEditModal;
