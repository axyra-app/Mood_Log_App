import { Edit, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import JournalEditor from '../components/JournalEditor';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, templates, prompts, loading, error, createEntry, updateEntry, deleteEntry, getJournalStats } =
    useJournal(user?.uid || '');

  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | undefined>(undefined);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Manejar estado de ánimo seleccionado desde el historial
  const selectedMoodLog = location.state?.selectedMoodLog;
  const editMode = location.state?.editMode;

  // Efecto para manejar la selección de estado de ánimo desde el historial
  useEffect(() => {
    if (selectedMoodLog && editMode) {
      // Crear una entrada de diario basada en el estado de ánimo seleccionado
      const moodEntry: JournalEntry = {
        id: `mood-${selectedMoodLog.id}`,
        title: `Estado de ánimo - ${selectedMoodLog.mood}/10`,
        content: `Estado de ánimo: ${selectedMoodLog.mood}/10${selectedMoodLog.notes ? `\n\nNotas: ${selectedMoodLog.notes}` : ''}${selectedMoodLog.energy ? `\nEnergía: ${selectedMoodLog.energy}/10` : ''}${selectedMoodLog.stress ? `\nEstrés: ${selectedMoodLog.stress}/10` : ''}${selectedMoodLog.sleep ? `\nSueño: ${selectedMoodLog.sleep}/10` : ''}`,
        date: selectedMoodLog.date || selectedMoodLog.createdAt,
        tags: ['estado-ánimo', 'mood-log'],
        aiAnalysis: null,
        createdAt: selectedMoodLog.createdAt,
        updatedAt: selectedMoodLog.createdAt
      };
      
      setEditingEntry(moodEntry);
      setShowEditor(true);
      
      // Limpiar el estado de navegación
      navigate('/journal', { replace: true });
    }
  }, [selectedMoodLog, editMode, navigate]);


  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el diario');
    }
  }, [error]);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleCreateEntry = () => {
    setEditingEntry(undefined);
    setSelectedTemplate(undefined);
    setShowEditor(true);
    setShowTemplates(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedTemplate(undefined);
    setSelectedPrompt(undefined);
    setShowEditor(true);
    setShowTemplates(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await deleteEntry(entryId);
        toast.success('Entrada eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error('Error al eliminar la entrada');
      }
    }
  };

  const handleTemplateSelect = (template: JournalTemplate) => {
    setSelectedTemplate(template);
    setSelectedPrompt(undefined);
    setEditingEntry(undefined);
    setShowEditor(true);
    setShowTemplates(false);
  };

  const handlePromptSelect = (prompt: JournalPrompt) => {
    setSelectedPrompt(prompt);
    setSelectedTemplate(undefined);
    setEditingEntry(undefined);
    setShowEditor(true);
    setShowTemplates(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return '😐';
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  };

  if (loading && entries.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando tu diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        title='Mi Diario'
        subtitle='Reflexiona sobre tus pensamientos y emociones'
        backTo='/dashboard'
        backLabel='Volver al Dashboard'
      />

      {/* Contenido Principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Barra de herramientas */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
            {/* Botones de acción - Responsive */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
              <button
                onClick={handleCreateEntry}
                className='flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 w-full sm:w-auto'
              >
                <Plus className='w-4 h-4' />
                <span className='text-sm sm:text-base'>Nueva Entrada</span>
              </button>

              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex items-center justify-center space-x-2 px-4 py-2 ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border rounded-lg transition-colors w-full sm:w-auto`}
              >
                <Sparkles className='w-4 h-4' />
                <span className='text-sm sm:text-base'>Plantillas</span>
              </button>

            </div>

            {/* Filtros - Responsive */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
              <div className='relative flex-1'>
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  } w-4 h-4`}
                />
                <input
                  type='text'
                  placeholder='Buscar entradas...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full`}
                />
              </div>

            </div>
          </div>

          {/* Plantillas */}
          {showTemplates && (
            <div
              className={`mt-4 p-4 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-lg border shadow-sm`}
            >
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                Plantillas
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 text-left border ${
                      isDarkMode
                        ? 'border-gray-600 hover:border-purple-400 hover:bg-gray-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    } rounded-lg transition-colors`}
                  >
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{template.name}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Lista de entradas */}
        {filteredEntries.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>📝</div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              {searchTerm ? 'No se encontraron entradas' : 'Tu diario está vacío'}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza escribiendo tu primera entrada para reflexionar sobre tu día'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateEntry}
                className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200'
              >
                Crear Primera Entrada
              </button>
            )}
          </div>
        ) : (
          <div className='grid gap-4 sm:gap-6'>
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {entry.title}
                      </h3>
                      {entry.mood && (
                        <span className='text-lg' title={`Estado de ánimo: ${entry.mood}/10`}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      {formatDate(entry.date)}
                    </p>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className={`p-2 ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                      } transition-colors`}
                      title='Editar entrada'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className={`p-2 ${
                        isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                      } transition-colors`}
                      title='Eliminar entrada'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                <div className='mb-4'>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                    {entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
                  </p>
                </div>

                {entry.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 ${
                          isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'
                        } rounded-full text-xs`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {entry.aiAnalysis && (
                  <div
                    className={`p-4 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                    } rounded-lg border`}
                  >
                    <div className='flex items-center space-x-2 mb-3'>
                      <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                        Análisis de IA
                      </span>
                    </div>

                    {/* Resumen Principal */}
                    {entry.aiAnalysis.summary && (
                      <div
                        className={`mb-3 p-3 ${
                          isDarkMode ? 'bg-gray-800 border-purple-600' : 'bg-white border-purple-100'
                        } rounded-lg border`}
                      >
                        <div
                          className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-1`}
                        >
                          Resumen:
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {entry.aiAnalysis.summary}
                        </div>
                      </div>
                    )}

                    {/* Sentimiento */}
                    <div className='mb-2'>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        Sentimiento:{' '}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.aiAnalysis.sentiment === 'positive'
                            ? isDarkMode
                              ? 'bg-green-800 text-green-200'
                              : 'bg-green-100 text-green-800'
                            : entry.aiAnalysis.sentiment === 'negative'
                            ? isDarkMode
                              ? 'bg-red-800 text-red-200'
                              : 'bg-red-100 text-red-800'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {entry.aiAnalysis.sentiment === 'positive'
                          ? 'Positivo'
                          : entry.aiAnalysis.sentiment === 'negative'
                          ? 'Negativo'
                          : 'Neutral'}
                      </span>
                    </div>

                    {/* Temas */}
                    {entry.aiAnalysis.themes && entry.aiAnalysis.themes.length > 0 && (
                      <div className='mb-2'>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Temas:{' '}
                        </span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {entry.aiAnalysis.themes.map((theme, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 ${
                                isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'
                              } rounded-full text-xs`}
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {entry.aiAnalysis.insights && entry.aiAnalysis.insights.length > 0 && (
                      <div className='mb-2'>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Insights:{' '}
                        </span>
                        <ul className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 space-y-1`}>
                          {entry.aiAnalysis.insights.map((insight, index) => (
                            <li key={index} className='flex items-start'>
                              <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-500'} mr-1`}>•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recomendaciones */}
                    {entry.aiAnalysis.recommendations && entry.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Recomendaciones:{' '}
                        </span>
                        <ul className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 space-y-1`}>
                          {entry.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className='flex items-start'>
                              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-500'} mr-1`}>→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor de Diario */}
      {showEditor && (
        <JournalEditor
          onClose={() => {
            setShowEditor(false);
            setEditingEntry(undefined);
            setSelectedTemplate(undefined);
            setSelectedPrompt(undefined);
          }}
          entry={editingEntry}
          template={selectedTemplate}
          prompt={selectedPrompt}
        />
      )}
    </div>
  );
};

export default Journal;
