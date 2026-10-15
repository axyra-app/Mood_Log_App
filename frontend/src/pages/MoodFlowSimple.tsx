import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMood } from '../hooks/useMood';
import { moodAnalyzerAgent } from '../services/specializedAgents';
import { AIRecommendation, MoodAnalysisResult } from '../services/aiService';
import Logo from '../components/Logo';

const MoodFlowSimple: React.FC = () => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { createMoodLog } = useMood();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [feelings, setFeelings] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: mood selection, 2: feelings description, 3: additional details, 4: analysis
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [moodData, setMoodData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<MoodAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiDataConsent, setAiDataConsent] = useState(false);
  const navigate = useNavigate();

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥰', '😍', '🌟'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien', 'Excelente', 'Fantástico', 'Increíble', 'Perfecto', 'Épico'];

  const activityOptions = [
    'Ejercicio',
    'Trabajo',
    'Estudio',
    'Socializar',
    'Descansar',
    'Cocinar',
    'Leer',
    'Ver películas',
    'Música',
    'Pasear',
    'Meditar',
    'Jugar',
    'Compras',
    'Limpieza',
    'Otro',
  ];

  const emotionOptions = [
    'Felicidad',
    'Tristeza',
    'Ansiedad',
    'Enojo',
    'Miedo',
    'Calma',
    'Excitación',
    'Frustración',
    'Gratitud',
    'Soledad',
    'Amor',
    'Esperanza',
    'Desesperación',
    'Orgullo',
    'Vergüenza',
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMoodSelect = (mood: number) => {
    setCurrentMood(mood);
    setStep(2);
  };

  const handleFeelingsSubmit = () => {
    if (feelings.trim()) {
      setStep(3);
    }
  };

  const handleAdditionalDetailsSubmit = () => {
    setStep(4);
  };

  const handleSubmit = async () => {
    if (!currentMood || !feelings.trim()) return;

    setLoading(true);
    try {
      const moodLogData = {
        mood: currentMood,
        notes: feelings,
        activities,
        emotions,
        energy,
        stress,
        sleep,
      };

      const result = await createMoodLog(moodLogData);
      setMoodData(result);
      setAiAnalysis(null);
      setShowAnalysis(true);
      toast.success('Estado de ánimo guardado.');
    } catch (error) {
      console.error('Error creating mood log:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el estado de ánimo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMood = async () => {
    if (!aiDataConsent) {
      toast.error('Confirma el envío de estos datos antes de solicitar el análisis.');
      return;
    }
    if (currentMood === null || !moodData) return;

    setAnalyzing(true);
    try {
      const response = await moodAnalyzerAgent.analyzeMood({
        moodLogs: [{
          mood: currentMood,
          energy,
          stress,
          sleep,
          activities,
          emotions,
          notes: feelings,
          createdAt: new Date().toISOString(),
        }],
      }) as Record<string, unknown>;
      const asTextList = (value: unknown): string[] =>
        Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
      const summary = typeof response.summary === 'string' ? response.summary : '';
      const insights = asTextList(response.insights);
      const recommendations: AIRecommendation[] = asTextList(response.recommendations).map((description) => ({
        type: 'general',
        priority: 'medium',
        title: 'Sugerencia para reflexionar',
        description,
        actionable: description,
        category: 'Autorreflexión',
      }));
      const moodTrend = response.moodTrend === 'improving' || response.moodTrend === 'declining'
        ? response.moodTrend
        : 'stable';
      const riskLevel = response.riskLevel === 'medium' || response.riskLevel === 'high'
        ? response.riskLevel
        : 'low';

      setAiAnalysis({
        summary,
        insights,
        recommendations,
        moodTrend,
        riskLevel,
        textualAnalysis: {
          title: 'Reflexión sobre tu registro',
          description: summary,
          insights,
          recommendations: asTextList(response.nextSteps),
        },
      });
      toast.success('Reflexión generada.');
    } catch (error) {
      console.error('Error generating mood analysis:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo generar el análisis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const toggleActivity = (activity: string) => {
    setActivities((prev) => (prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]));
  };

  const toggleEmotion = (emotion: string) => {
    setEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]));
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Header */}
      <header
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <Logo size="sm" />
            </div>

            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Modo oscuro */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* Volver al Dashboard */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <span className='hidden sm:inline'>← Volver al Dashboard</span>
                <span className='sm:hidden'>← Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex items-center justify-center space-x-4'>
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className='flex items-center'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-purple-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-purple-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className='text-center mt-2'>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {step === 1 && 'Selecciona tu estado de ánimo'}
            {step === 2 && 'Describe tus sentimientos'}
            {step === 3 && 'Detalles adicionales'}
            {step === 4 && 'Análisis completo'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Step 1: Mood Selection */}
        {step === 1 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-600' : 'bg-purple-100'}`}>
                <span className="text-2xl">😊</span>
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                ¿Cómo te sientes hoy?
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Selecciona tu estado de ánimo actual
              </p>
            </div>
            
            <div className='grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4 mb-8'>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  className={`p-3 sm:p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center min-h-[100px] ${
                    currentMood === index + 1
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg scale-105'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-purple-400 hover:bg-gray-700 hover:shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className='text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2'>{emoji}</div>
                  <div className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {moodLabels[index]}
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {index + 1}/10
                  </div>
                </button>
              ))}
            </div>
            
            {currentMood && (
              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Seleccionaste: {moodLabels[currentMood - 1]} ({currentMood}/10)
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  ¡Perfecto! Ahora vamos a conocer más detalles
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Feelings Description */}
        {step === 2 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8`}>
            <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Cuéntanos más sobre cómo te sientes
            </h2>
            <div className='space-y-6'>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Describe tus sentimientos y pensamientos
                </label>
                <textarea
                  value={feelings}
                  onChange={(e) => setFeelings(e.target.value)}
                  placeholder='Escribe aquí cómo te sientes, qué pensamientos tienes, qué te preocupa o qué te hace feliz...'
                  className={`w-full h-32 p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              <div className='flex justify-between'>
                <button
                  onClick={() => setStep(1)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleFeelingsSubmit}
                  disabled={!feelings.trim()}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    feelings.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8`}>
            <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Detalles adicionales
            </h2>
            <div className='space-y-8'>
              {/* Activities */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  ¿Qué actividades realizaste hoy?
                </label>
                <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        activities.includes(activity)
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotions */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  ¿Qué emociones experimentaste?
                </label>
                <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        emotions.includes(emotion)
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy, Stress, Sleep */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Energía (1-10)
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className='w-full'
                  />
                  <div className='text-center mt-1'>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{energy}</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Estrés (1-10)
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={stress}
                    onChange={(e) => setStress(Number(e.target.value))}
                    className='w-full'
                  />
                  <div className='text-center mt-1'>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stress}</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Calidad del sueño (1-10)
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className='w-full'
                  />
                  <div className='text-center mt-1'>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sleep}</span>
                  </div>
                </div>
              </div>

              <div className='flex justify-between'>
                <button
                  onClick={() => setStep(2)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleAdditionalDetailsSubmit}
                  className='px-6 py-3 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700'
                >
                  Continuar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Analysis */}
        {step === 4 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8`}>
            <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Análisis de tu estado de ánimo
            </h2>
            <div className='space-y-6'>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Resumen de tu registro
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Estado de ánimo: <span className='font-medium'>{moodLabels[currentMood! - 1]}</span>
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Energía: <span className='font-medium'>{energy}/10</span>
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Estrés: <span className='font-medium'>{stress}/10</span>
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Sueño: <span className='font-medium'>{sleep}/10</span>
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Actividades: <span className='font-medium'>{activities.length}</span>
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Emociones: <span className='font-medium'>{emotions.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex justify-between'>
                <button
                  onClick={() => setStep(3)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? 'Guardando...' : 'Guardar registro'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Panel */}
        {showAnalysis && moodData && (
          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ✅ Mood Log Guardado Exitosamente
            </h3>

            <div className='space-y-4'>
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${
                  isDarkMode ? 'border-green-800' : 'border-green-200'
                }`}
              >
                <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  📊 Análisis de tu Estado de Ánimo
                </h4>
                <div className='mt-2 space-y-2'>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Estado:</strong> {moodLabels[currentMood! - 1]} ({currentMood}/10)
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Energía:</strong> {energy}/10 {energy >= 7 ? '🔋' : energy >= 4 ? '⚡' : '🔋'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Estrés:</strong> {stress}/10 {stress <= 3 ? '😌' : stress <= 6 ? '😐' : '😰'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Sueño:</strong> {sleep}/10 {sleep >= 7 ? '😴' : sleep >= 4 ? '😑' : '😵'}
                  </p>
                </div>
              </div>

              <label className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300'>
                <input
                  type='checkbox'
                  checked={aiDataConsent}
                  onChange={(event) => setAiDataConsent(event.target.checked)}
                  className='mt-1'
                />
                <span>Si solicito una reflexión, entiendo que mi estado de ánimo, medidas, actividades, emociones y notas se enviarán a Groq.</span>
              </label>
              {!aiAnalysis && (
                <button
                  type='button'
                  onClick={handleAnalyzeMood}
                  disabled={analyzing || !aiDataConsent}
                  className='px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                >
                  {analyzing ? 'Analizando...' : 'Solicitar reflexión con IA'}
                </button>
              )}

              {/* Análisis 1: Estrategias de Regulación Emocional */}
              {aiAnalysis?.emotionalRegulation && (
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'} border ${
                    isDarkMode ? 'border-purple-800' : 'border-purple-200'
                  }`}
                >
                  <h4 className={`font-semibold text-base mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                    🧘 {aiAnalysis.emotionalRegulation.title}
                  </h4>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiAnalysis.emotionalRegulation.description}
                  </p>
                  <div className="space-y-2">
                    {aiAnalysis.emotionalRegulation.strategies.map((strategy, index) => (
                      <div key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} border-l-2 border-purple-400`}>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {index + 1}. {strategy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análisis 2: Estrategia de Mantenimiento del Bienestar */}
              {aiAnalysis?.wellBeingMaintenance && (
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${
                    isDarkMode ? 'border-green-800' : 'border-green-200'
                  }`}
                >
                  <h4 className={`font-semibold text-base mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    💚 {aiAnalysis.wellBeingMaintenance.title}
                  </h4>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiAnalysis.wellBeingMaintenance.description}
                  </p>
                  <div className="space-y-2">
                    {aiAnalysis.wellBeingMaintenance.strategies.map((strategy, index) => (
                      <div key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} border-l-2 border-green-400`}>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {index + 1}. {strategy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análisis 3: Análisis de Reflexión Personal (Texto) */}
              {aiAnalysis?.textualAnalysis && (
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${
                    isDarkMode ? 'border-blue-800' : 'border-blue-200'
                  }`}
                >
                  <h4 className={`font-semibold text-base mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    📝 {aiAnalysis.textualAnalysis.title}
                  </h4>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiAnalysis.textualAnalysis.description}
                  </p>
                  
                  {/* Insights */}
                  {aiAnalysis.textualAnalysis.insights.length > 0 && (
                    <div className="mb-3">
                      <h5 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                        Insights:
                      </h5>
                      <div className="space-y-1">
                        {aiAnalysis.textualAnalysis.insights.map((insight, index) => (
                          <div key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} border-l-2 border-blue-400`}>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              💡 {insight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {aiAnalysis.textualAnalysis.recommendations.length > 0 && (
                    <div>
                      <h5 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                        Recomendaciones:
                      </h5>
                      <div className="space-y-1">
                        {aiAnalysis.textualAnalysis.recommendations.map((recommendation, index) => (
                          <div key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} border-l-2 border-blue-400`}>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              → {recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recomendaciones generales (si no hay análisis específicos) */}
              {analyzing && (
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${
                    isDarkMode ? 'border-blue-800' : 'border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Generando análisis personalizados...
                    </p>
                  </div>
                </div>
              )}

              {/* Fallback si no hay análisis pero hay recomendaciones generales */}
              {!analyzing && aiAnalysis && !aiAnalysis.emotionalRegulation && !aiAnalysis.wellBeingMaintenance && !aiAnalysis.textualAnalysis && aiAnalysis.recommendations && (
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${
                    isDarkMode ? 'border-blue-800' : 'border-blue-200'
                  }`}
                >
                  <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>💡 Recomendaciones Generales</h4>
                  <div className="mt-2 space-y-2">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border-l-4 ${
                        rec.priority === 'high' ? 'border-red-500' : 
                        rec.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                      }`}>
                        <h5 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {rec.title}
                        </h5>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                          {rec.description}
                        </p>
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} mt-1 whitespace-pre-line`}>
                          💡 {rec.actionable}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex justify-center pt-4'>
                <button
                  onClick={handleBackToDashboard}
                  className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform duration-200 font-medium'
                >
                  🏠 Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={handleLogout}
          onClose={() => setShowLogoutModal(false)}
          loading={logoutLoading}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default MoodFlowSimple;
