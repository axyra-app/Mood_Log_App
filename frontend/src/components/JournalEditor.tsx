import { BookOpen, Clock, Lightbulb, Plus, Save, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry, JournalTemplate, JournalPrompt } from '../types';
import { useJournal } from '../hooks/useJournal';

interface JournalEditorProps {
  entry?: JournalEntry;
  template?: JournalTemplate;
  prompt?: JournalPrompt;
  onClose: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ entry, template, prompt, onClose }) => {
  const { user } = useAuth();
  const { createEntry, updateEntry, analyzeEntry } = useJournal(user?.uid || '');
  
  const [title, setTitle] = useState(entry?.title || template?.title || prompt?.title || '');
  const [content, setContent] = useState(entry?.content || template?.content || prompt?.content || '');
  const [mood, setMood] = useState<number | undefined>(entry?.mood);
  const [energy, setEnergy] = useState<number | undefined>(entry?.energy);
  const [stress, setStress] = useState<number | undefined>(entry?.stress);
  const [sleep, setSleep] = useState<number | undefined>(entry?.sleep);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [activities, setActivities] = useState<string[]>(entry?.activities || []);
  const [emotions, setEmotions] = useState<string[]>(entry?.emotions || []);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(entry?.aiAnalysis || null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [newTag, setNewTag] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newEmotion, setNewEmotion] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Por favor completa el título y contenido');
      return;
    }

    setIsSaving(true);
    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        energy,
        stress,
        sleep,
        tags,
        activities,
        emotions,
        aiAnalysis,
        date: entry?.date || new Date(),
      };

      if (entry) {
        await updateEntry(entry.id, entryData);
        toast.success('Entrada actualizada exitosamente');
      } else {
        await createEntry(entryData);
        toast.success('Entrada creada exitosamente');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Error al guardar la entrada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Por favor escribe algo antes de analizar');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeEntry(content);
      setAiAnalysis(analysis);
      setShowAIAnalysis(true);
      toast.success('Análisis completado');
    } catch (error) {
      console.error('Error analyzing entry:', error);
      toast.error('Error al analizar la entrada');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === ' ' && e.ctrlKey) {
      handleAnalyze();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (activityToRemove: string) => {
    setActivities(activities.filter(activity => activity !== activityToRemove));
  };

  const addEmotion = () => {
    if (newEmotion.trim() && !emotions.includes(newEmotion.trim())) {
      setEmotions([...emotions, newEmotion.trim()]);
      setNewEmotion('');
    }
  };

  const removeEmotion = (emotionToRemove: string) => {
    setEmotions(emotions.filter(emotion => emotion !== emotionToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {entry ? 'Editar Entrada' : 'Nueva Entrada del Diario'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analizando...' : 'IA'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la entrada
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escribe un título para tu entrada..."
                  className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido
                </label>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe aquí tu entrada del diario... (Ctrl+Enter para guardar, Ctrl+Espacio para IA)"
                  className="w-full min-h-[400px] px-4 py-3 text-base leading-relaxed border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* AI Analysis */}
              {aiAnalysis && showAIAnalysis && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Análisis de IA</h3>
                    </div>
                    <button
                      onClick={() => setShowAIAnalysis(false)}
                      className="text-purple-400 hover:text-purple-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-gray-700">
                    {typeof aiAnalysis === 'string' ? (
                      <p className="whitespace-pre-wrap">{aiAnalysis}</p>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-1">Resumen:</h4>
                          <p>{aiAnalysis.summary}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-1">Sentimiento:</h4>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            aiAnalysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            aiAnalysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {aiAnalysis.sentiment === 'positive' ? 'Positivo' :
                             aiAnalysis.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                          </span>
                        </div>
                        {aiAnalysis.themes && aiAnalysis.themes.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-purple-700 mb-1">Temas:</h4>
                            <div className="flex flex-wrap gap-1">
                              {aiAnalysis.themes.map((theme: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                  {theme}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-purple-700 mb-1">Insights:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiAnalysis.insights.map((insight: string, index: number) => (
                                <li key={index}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-purple-700 mb-1">Recomendaciones:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                                <li key={index}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Takes 1 column */}
            <div className="space-y-6">
              {/* Mood & Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Estado de Ánimo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Estado de Ánimo (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={mood || ''}
                      onChange={(e) => setMood(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Energía (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={energy || ''}
                      onChange={(e) => setEnergy(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Estrés (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={stress || ''}
                      onChange={(e) => setStress(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sueño (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={sleep || ''}
                      onChange={(e) => setSleep(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)} className="text-purple-400 hover:text-purple-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button 
                    onClick={addTag} 
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Activities */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Actividades</h3>
                <div className="space-y-2 mb-3">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 text-green-700 rounded-lg"
                    >
                      <span className="text-sm">{activity}</span>
                      <button onClick={() => removeActivity(activity)} className="text-green-400 hover:text-green-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="Nueva actividad"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                  />
                  <button
                    onClick={addActivity}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Emotions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Emociones</h3>
                <div className="space-y-2 mb-3">
                  {emotions.map((emotion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-pink-50 text-pink-700 rounded-lg"
                    >
                      <span className="text-sm">{emotion}</span>
                      <button onClick={() => removeEmotion(emotion)} className="text-pink-400 hover:text-pink-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newEmotion}
                    onChange={(e) => setNewEmotion(e.target.value)}
                    placeholder="Nueva emoción"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addEmotion()}
                  />
                  <button 
                    onClick={addEmotion} 
                    className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;