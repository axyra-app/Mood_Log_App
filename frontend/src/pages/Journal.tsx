import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';
import JournalEditor from '../components/JournalEditor';
import Header from '../components/Header';
import { Plus, Search, Sparkles, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entries, templates, prompts, loading, error, createEntry, updateEntry, deleteEntry, getJournalStats } = useJournal(user?.uid || '');
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | undefined>(undefined);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el diario');
    }
  }, [error]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || entry.date.toDateString() === new Date(selectedDate).toDateString();
    return matchesSearch && matchesDate;
  });

  const handleCreateEntry = () => {
    setEditingEntry(undefined);
    setSelectedTemplate(undefined);
    setSelectedPrompt(undefined);
    setShowEditor(true);
    setShowPrompts(false);
    setShowTemplates(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedTemplate(undefined);
    setSelectedPrompt(undefined);
    setShowEditor(true);
    setShowPrompts(false);
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
    setShowPrompts(false);
    setShowTemplates(false);
  };

  const handlePromptSelect = (prompt: JournalPrompt) => {
    setSelectedPrompt(prompt);
    setSelectedTemplate(undefined);
    setEditingEntry(undefined);
    setShowEditor(true);
    setShowPrompts(false);
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
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando tu diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header 
        title="Mi Diario"
        subtitle="Reflexiona sobre tus pensamientos y emociones"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
      />

      {/* Contenido Principal */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Barra de herramientas */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
            {/* Botones de acción */}
            <div className='flex flex-wrap gap-2 sm:gap-3'>
              <button
                onClick={handleCreateEntry}
                className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200'
              >
                <Plus className='w-4 h-4' />
                <span>Nueva Entrada</span>
              </button>
              
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className='flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Sparkles className='w-4 h-4' />
                <span>Plantillas</span>
              </button>
              
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className='flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Sparkles className='w-4 h-4' />
                <span>Prompts</span>
              </button>
            </div>

            {/* Filtros */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type='text'
                  placeholder='Buscar entradas...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64'
                />
              </div>
              
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Plantillas */}
          {showTemplates && (
            <div className='mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Plantillas</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className='p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors'
                  >
                    <h4 className='font-medium text-gray-900'>{template.name}</h4>
                    <p className='text-sm text-gray-600 mt-1'>{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompts */}
          {showPrompts && (
            <div className='mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Prompts de Escritura</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptSelect(prompt)}
                    className='p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors'
                  >
                    <h4 className='font-medium text-gray-900'>{prompt.title}</h4>
                    <p className='text-sm text-gray-600 mt-1'>{prompt.prompt}</p>
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
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {searchTerm || selectedDate ? 'No se encontraron entradas' : 'Tu diario está vacío'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchTerm || selectedDate 
                ? 'Intenta con otros términos de búsqueda o filtros' 
                : 'Comienza escribiendo tu primera entrada para reflexionar sobre tu día'
              }
            </p>
            {!searchTerm && !selectedDate && (
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
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <h3 className='text-lg font-semibold text-gray-900'>{entry.title}</h3>
                      {entry.mood && (
                        <span className='text-lg' title={`Estado de ánimo: ${entry.mood}/10`}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500 mb-2'>{formatDate(entry.date)}</p>
                  </div>
                  
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                      title='Editar entrada'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                      title='Eliminar entrada'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                <div className='mb-4'>
                  <p className='text-gray-700 line-clamp-3'>
                    {entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
                  </p>
                </div>

                {entry.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {entry.tags.map((tag, index) => (
                      <span key={index} className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {entry.aiAnalysis && (
                  <div className='p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                    <div className='flex items-center space-x-2 mb-3'>
                      <Sparkles className='w-5 h-5 text-purple-600' />
                      <span className='text-sm font-semibold text-purple-800'>Análisis de IA</span>
                    </div>
                    
                    {/* Resumen Principal */}
                    {entry.aiAnalysis.summary && (
                      <div className='mb-3 p-3 bg-white rounded-lg border border-purple-100'>
                        <div className='text-sm font-medium text-purple-800 mb-1'>Resumen:</div>
                        <div className='text-sm text-gray-700'>{entry.aiAnalysis.summary}</div>
                      </div>
                    )}
                    
                    {/* Sentimiento */}
                    <div className='mb-2'>
                      <span className='text-sm font-medium text-purple-700'>Sentimiento: </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.aiAnalysis.sentiment === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : entry.aiAnalysis.sentiment === 'negative'
                            ? 'bg-red-100 text-red-800'
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
                        <span className='text-sm font-medium text-purple-700'>Temas: </span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {entry.aiAnalysis.themes.map((theme, index) => (
                            <span key={index} className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs'>
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Insights */}
                    {entry.aiAnalysis.insights && entry.aiAnalysis.insights.length > 0 && (
                      <div className='mb-2'>
                        <span className='text-sm font-medium text-purple-700'>Insights: </span>
                        <ul className='text-xs text-gray-600 mt-1 space-y-1'>
                          {entry.aiAnalysis.insights.map((insight, index) => (
                            <li key={index} className='flex items-start'>
                              <span className='text-purple-500 mr-1'>•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Recomendaciones */}
                    {entry.aiAnalysis.recommendations && entry.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <span className='text-sm font-medium text-purple-700'>Recomendaciones: </span>
                        <ul className='text-xs text-gray-600 mt-1 space-y-1'>
                          {entry.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className='flex items-start'>
                              <span className='text-green-500 mr-1'>→</span>
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
