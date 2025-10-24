import { BookOpen, Clock, Lightbulb, Plus, Save, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';

interface JournalEditorProps {
  onClose: () => void;
  entry?: JournalEntry;
  template?: JournalTemplate;
  prompt?: JournalPrompt;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ onClose, entry, template, prompt }) => {
  const { user } = useAuth();
  const { createEntry, updateEntry, analyzeEntry } = useJournal(user?.uid || '');
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || template?.content || '');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [mood, setMood] = useState<number | undefined>(entry?.mood);
  const [energy, setEnergy] = useState<number | undefined>(entry?.energy);
  const [stress, setStress] = useState<number | undefined>(entry?.stress);
  const [sleep, setSleep] = useState<number | undefined>(entry?.sleep);
  const [activities, setActivities] = useState<string[]>(entry?.activities || []);
  const [emotions, setEmotions] = useState<string[]>(entry?.emotions || []);
  const [aiAnalysis, setAiAnalysis] = useState(entry?.aiAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newEmotion, setNewEmotion] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) return;

    try {
      setIsSaving(true);

      const entryData = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        date: entry?.date || new Date(),
        tags,
        mood,
        energy,
        stress,
        sleep,
        activities,
        emotions,
        isPrivate: true,
      };

      if (entry) {
        await updateEntry(entry.id, entryData);
      } else {
        await createEntry(entryData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    try {
      setIsAnalyzing(true);
      const analysis = await analyzeEntry(content);
      if (analysis) {
        setAiAnalysis(analysis);
        setShowAIAnalysis(true);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (activityToRemove: string) => {
    setActivities(activities.filter((activity) => activity !== activityToRemove));
  };

  const addEmotion = () => {
    if (newEmotion.trim() && !emotions.includes(newEmotion.trim())) {
      setEmotions([...emotions, newEmotion.trim()]);
      setNewEmotion('');
    }
  };

  const removeEmotion = (emotionToRemove: string) => {
    setEmotions(emotions.filter((emotion) => emotion !== emotionToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === ' ' && e.ctrlKey) {
      handleAnalyze();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[99vh] sm:max-h-[90vh] overflow-hidden'>
        {/* Header - Responsive */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-3 sm:gap-0'>
          <div className='flex items-center space-x-3'>
            <BookOpen className='w-5 h-5 sm:w-6 sm:h-6 text-purple-600' />
            <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
              {entry ? 'Editar Entrada' : 'Nueva Entrada del Diario'}
            </h2>
          </div>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto'>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content.trim()}
              className='flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm sm:text-base'
            >
              <Sparkles className='w-4 h-4' />
              <span>{isAnalyzing ? 'Analizando...' : 'IA'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !content.trim()}
              className='flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base'
            >
              <Save className='w-4 h-4' />
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button onClick={onClose} className='p-2 text-gray-400 hover:text-gray-600 self-end sm:self-auto'>
              ✕
            </button>
          </div>
        </div>

        {/* Content - Responsive */}
        <div className='flex flex-col lg:flex-row h-[calc(100vh-120px)] sm:h-[calc(95vh-100px)] max-h-[800px]'>
          {/* Main Editor */}
          <div className='flex-1 p-4 sm:p-6 overflow-y-auto min-h-0'>
            {/* Title */}
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Título de tu entrada... (obligatorio)'
              className='w-full text-2xl font-bold border-none outline-none mb-4 placeholder-gray-400'
              onKeyDown={handleKeyPress}
            />

            {/* Prompt or Template Info */}
            {(prompt || template) && (
              <div className='mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='flex items-center space-x-2 mb-2'>
                  <Lightbulb className='w-5 h-5 text-blue-600' />
                  <span className='font-semibold text-blue-800'>{prompt ? 'Prompt sugerido:' : 'Plantilla:'}</span>
                </div>
                <p className='text-blue-700'>{prompt ? prompt.title : template?.title}</p>
                {prompt && (
                  <div className='mt-2 text-sm text-blue-600'>
                    <span className='flex items-center space-x-1'>
                      <Clock className='w-4 h-4' />
                      <span>{prompt.estimatedTime} min</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Escribe aquí tu entrada del diario... (Ctrl+Enter para guardar, Ctrl+Espacio para IA)'
              className='w-full min-h-[200px] sm:min-h-[300px] text-base sm:text-lg leading-relaxed border-none outline-none resize-none placeholder-gray-400'
              onKeyDown={handleKeyPress}
            />

            {/* AI Analysis */}
            {aiAnalysis && showAIAnalysis && (
              <div className='mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    <Sparkles className='w-5 h-5 text-purple-600' />
                    <span className='font-semibold text-purple-800'>Análisis de IA</span>
                  </div>
                  <button onClick={() => setShowAIAnalysis(false)} className='text-purple-400 hover:text-purple-600'>
                    ✕
                  </button>
                </div>

                <div className='space-y-3'>
                  <div>
                    <span className='font-medium text-purple-700'>Sentimiento: </span>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        aiAnalysis.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : aiAnalysis.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {aiAnalysis.sentiment === 'positive'
                        ? 'Positivo'
                        : aiAnalysis.sentiment === 'negative'
                        ? 'Negativo'
                        : 'Neutral'}
                    </span>
                  </div>

                  {aiAnalysis.themes.length > 0 && (
                    <div>
                      <span className='font-medium text-purple-700'>Temas: </span>
                      <span className='text-purple-600'>{aiAnalysis.themes.join(', ')}</span>
                    </div>
                  )}

                  {aiAnalysis.insights.length > 0 && (
                    <div>
                      <span className='font-medium text-purple-700'>Insights:</span>
                      <ul className='mt-1 list-disc list-inside text-purple-600'>
                        {aiAnalysis.insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <span className='font-medium text-purple-700'>Recomendaciones:</span>
                      <ul className='mt-1 list-disc list-inside text-purple-600'>
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Responsive */}
          <div className='w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 p-3 sm:p-6 overflow-y-auto bg-gray-50 max-h-[45vh] lg:max-h-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {/* Mood & Metrics - Responsive */}
            <div className='mb-3 sm:mb-6'>
              <h3 className='font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base'>Estado de Ánimo</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3'>
                <div>
                  <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                    Estado de Ánimo (1=Muy mal, 10=Excelente)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    value={mood || ''}
                    onChange={(e) => setMood(e.target.value ? Number(e.target.value) : undefined)}
                    className='w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                    Nivel de Energía (1=Muy bajo, 10=Muy alto)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    value={energy || ''}
                    onChange={(e) => setEnergy(e.target.value ? Number(e.target.value) : undefined)}
                    className='w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                    Nivel de Estrés (1=Muy bajo, 10=Muy alto)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    value={stress || ''}
                    onChange={(e) => setStress(e.target.value ? Number(e.target.value) : undefined)}
                    className='w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                    Calidad de Sueño (1=Muy mala, 10=Excelente)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='10'
                    value={sleep || ''}
                    onChange={(e) => setSleep(e.target.value ? Number(e.target.value) : undefined)}
                    className='w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className='mb-3 sm:mb-6'>
              <h3 className='font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base'>Etiquetas</h3>
              <div className='flex flex-wrap gap-2 mb-2'>
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className='flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm'
                  >
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className='text-purple-400 hover:text-purple-600'>
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder='Nueva etiqueta'
                  className='flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0 text-sm'
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <button
                  onClick={addTag}
                  className='px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex-shrink-0 text-sm'
                  title='Agregar etiqueta'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Activities */}
            <div className='mb-3 sm:mb-6'>
              <h3 className='font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base'>Actividades</h3>
              <div className='space-y-2 mb-2'>
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm'
                  >
                    <span>{activity}</span>
                    <button onClick={() => removeActivity(activity)} className='text-green-400 hover:text-green-600'>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder='Nueva actividad'
                  className='flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0 text-sm'
                  onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                />
                <button
                  onClick={addActivity}
                  className='px-2 sm:px-3 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-shrink-0 text-sm'
                  title='Agregar actividad'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Emotions */}
            <div className='mb-3 sm:mb-6'>
              <h3 className='font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base'>Emociones</h3>
              <div className='space-y-2 mb-2'>
                {emotions.map((emotion, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm'
                  >
                    <span>{emotion}</span>
                    <button onClick={() => removeEmotion(emotion)} className='text-pink-400 hover:text-pink-600'>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  placeholder='Nueva emoción'
                  className='flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0 text-sm'
                  onKeyPress={(e) => e.key === 'Enter' && addEmotion()}
                />
                <button
                  onClick={addEmotion}
                  className='px-2 sm:px-3 py-1 sm:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex-shrink-0 text-sm'
                  title='Agregar emoción'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;
