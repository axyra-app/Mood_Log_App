import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Filter,
  Grid,
  Heart,
  Lightbulb,
  List,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';
import JournalEditor from '../components/JournalEditor';
import Logo from '../components/Logo';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entries, templates, prompts, loading, error, createEntry, updateEntry, deleteEntry, getJournalStats } =
    useJournal(user?.uid || '');

  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | undefined>();
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (entries.length > 0) {
      setStats(getJournalStats());
    }
  }, [entries, getJournalStats]);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => entry.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags)));

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setSelectedTemplate(undefined);
    setSelectedPrompt(undefined);
    setShowEditor(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedTemplate(undefined);
    setSelectedPrompt(undefined);
    setShowEditor(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await deleteEntry(entryId);
      } catch (error) {
        console.error('Error deleting entry:', error);
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
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4 sm:py-6'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Botón de regreso */}
              <button
                onClick={() => navigate('/dashboard')}
                className='flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
                <span className='hidden sm:inline text-sm sm:text-base'>Volver al Dashboard</span>
                <span className='sm:hidden text-sm'>Volver</span>
              </button>
              
              {/* Logo y título */}
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                  <Logo size='sm' />
                </div>
                <div>
                  <h1 className='text-lg sm:text-2xl font-bold text-gray-900'>Mi Diario</h1>
                  <p className='hidden sm:block text-gray-600 text-sm'>Reflexiona sobre tus días y emociones</p>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200'
              >
                <Lightbulb className='w-4 h-4' />
                <span>Plantillas</span>
                {showTemplates ? <ChevronDown className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
              </button>

              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className='flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
              >
                <Sparkles className='w-4 h-4' />
                <span>Prompts</span>
                {showPrompts ? <ChevronDown className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
              </button>

              <button
                onClick={handleNewEntry}
                className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
              >
                <Plus className='w-4 h-4' />
                <span>Nueva Entrada</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4 pb-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>{stats.totalEntries}</div>
                <div className='text-sm text-gray-600'>Total Entradas</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>{stats.thisWeek}</div>
                <div className='text-sm text-gray-600'>Esta Semana</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>{stats.streak}</div>
                <div className='text-sm text-gray-600'>Racha</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600'>{stats.averageMood.toFixed(1)}</div>
                <div className='text-sm text-gray-600'>Humor Promedio</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-pink-600'>{stats.topTags.length}</div>
                <div className='text-sm text-gray-600'>Etiquetas Únicas</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates & Prompts */}
      {(showTemplates || showPrompts) && (
        <div className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            {showTemplates && (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Plantillas</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className='p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors'
                    >
                      <h4 className='font-semibold text-gray-900 mb-2'>{template.title}</h4>
                      <p className='text-sm text-gray-600 mb-2'>{template.description}</p>
                      <div className='flex flex-wrap gap-1'>
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className='px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs'>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPrompts && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Prompts de Escritura</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => handlePromptSelect(prompt)}
                      className='p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors'
                    >
                      <h4 className='font-semibold text-gray-900 mb-2'>{prompt.title}</h4>
                      <p className='text-sm text-gray-600 mb-2'>{prompt.content}</p>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2 text-xs text-gray-500'>
                          <Clock className='w-3 h-3' />
                          <span>{prompt.estimatedTime} min</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            prompt.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : prompt.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {prompt.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type='text'
                  placeholder='Buscar entradas...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Filter className='w-4 h-4 text-gray-400' />
                <select
                  value={selectedTags.length > 0 ? selectedTags[0] : ''}
                  onChange={(e) => setSelectedTags(e.target.value ? [e.target.value] : [])}
                  className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value=''>Todas las etiquetas</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <List className='w-4 h-4' />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <Grid className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {filteredEntries.length === 0 ? (
          <div className='text-center py-12'>
            <BookOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {entries.length === 0 ? 'Comienza tu diario' : 'No se encontraron entradas'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {entries.length === 0
                ? 'Escribe tu primera entrada y comienza a reflexionar sobre tus días'
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
            <button
              onClick={handleNewEntry}
              className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
            >
              Nueva Entrada
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors ${
                  viewMode === 'grid' ? 'p-6' : 'p-6'
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>{entry.title}</h3>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <div className='flex items-center space-x-1'>
                        <Calendar className='w-4 h-4' />
                        <span>{formatDate(entry.date)}</span>
                      </div>
                      {entry.mood && (
                        <div className='flex items-center space-x-1'>
                          <Heart className='w-4 h-4' />
                          <span>
                            {getMoodEmoji(entry.mood)} {entry.mood}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button onClick={() => handleEditEntry(entry)} className='p-2 text-gray-400 hover:text-purple-600'>
                      <Edit3 className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className='p-2 text-gray-400 hover:text-red-600'
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
                  <div className='p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <Sparkles className='w-4 h-4 text-purple-600' />
                      <span className='text-sm font-semibold text-purple-800'>Análisis de IA</span>
                    </div>
                    <div className='text-sm text-purple-700'>
                      <span className='font-medium'>Sentimiento: </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
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
