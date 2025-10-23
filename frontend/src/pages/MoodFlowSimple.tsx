import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrisisAlert from '../components/CrisisAlert';
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';
import { aiService, MoodAnalysisResult } from '../services/aiService';
import Logo from '../components/Logo';

const MoodFlowSimple: React.FC = () => {
  const { user, logout } = useAuth();
  const { createMoodLog, loading: moodLoading, error: moodError } = useMood();
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  const navigate = useNavigate();

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥰', '😍', '🌟'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien', 'Excelente', 'Fantástico', 'Increíble', 'Perfecto', 'Épico'];
  const moodColors = [
    'from-red-500 to-red-600',     // 1
    'from-red-400 to-red-500',     // 2
    'from-orange-500 to-orange-600', // 3
    'from-orange-400 to-orange-500', // 4
    'from-yellow-500 to-yellow-600', // 5
    'from-yellow-400 to-yellow-500', // 6
    'from-green-500 to-green-600',   // 7
    'from-green-400 to-green-500',   // 8
    'from-blue-500 to-blue-600',     // 9
    'from-purple-500 to-purple-600', // 10
  ];

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
      
      // Generate AI analysis
      setAnalyzing(true);
      try {
        const analysis = await aiService.analyzeMood({
          overallMood: currentMood,
          energy,
          stress,
          sleep,
          activities,
          emotions,
          feelings,
        });
        setAiAnalysis(analysis);
      } catch (aiError) {
        console.error('Error generating AI analysis:', aiError);
        // Provide fallback analysis
        const fallbackAnalysis = {
          summary: 'Análisis básico basado en tus datos',
          insights: [
            `Estado de ánimo: ${currentMood <= 3 ? 'Bajo' : currentMood >= 8 ? 'Alto' : 'Moderado'}`,
            `Energía: ${energy < 4 ? 'Baja' : energy > 7 ? 'Alta' : 'Moderada'}`,
            `Estrés: ${stress > 7 ? 'Alto' : stress < 4 ? 'Bajo' : 'Moderado'}`
          ],
          recommendations: [
            {
              type: 'general' as const,
              priority: 'medium' as const,
              title: 'Continúa registrando',
              description: 'Mantén el hábito de registrar tu estado de ánimo diariamente.',
              actionable: 'Intenta registrar tu estado de ánimo a la misma hora cada día.',
              category: 'Hábitos'
            }
          ],
          moodTrend: 'stable' as const,
          riskLevel: 'low' as const
        };
        setAiAnalysis(fallbackAnalysis);
      } finally {
        setAnalyzing(false);
      }
      
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error creating mood log:', error);
    } finally {
      setLoading(false);
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
      {/* Crisis Alert */}
      <CrisisAlert />

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
            
            <div className='grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 mb-8'>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    currentMood === index + 1
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg scale-105'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-purple-400 hover:bg-gray-700 hover:shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className='text-3xl mb-2'>{emoji}</div>
                  <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {moodLabels[index]}
                  </div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
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
                  {loading ? 'Guardando...' : 'Guardar y Analizar'}
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
                    <strong>Estado:</strong> {moodLabels[currentMood! - 1]} ({currentMood}/5)
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

              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${
                  isDarkMode ? 'border-blue-800' : 'border-blue-200'
                }`}
              >
                <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>💡 Recomendaciones</h4>
                <div className='mt-2 space-y-1'>
                  {analyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Generando recomendaciones personalizadas...
                      </p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-2">
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
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} mt-1`}>
                            💡 {rec.actionable}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {currentMood! >= 4 && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ✨ ¡Excelente estado de ánimo! Mantén las actividades que te hacen sentir bien.
                        </p>
                      )}
                      {energy < 5 && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          🔋 Considera hacer ejercicio ligero o tomar una caminata para aumentar tu energía.
                        </p>
                      )}
                      {stress > 6 && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          🧘 Practica técnicas de relajación como respiración profunda o meditación.
                        </p>
                      )}
                      {sleep < 5 && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          😴 Intenta establecer una rutina de sueño más consistente.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex justify-center pt-4'>
                <button
                  onClick={() => navigate('/dashboard')}
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
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
          loading={logoutLoading}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default MoodFlowSimple;
