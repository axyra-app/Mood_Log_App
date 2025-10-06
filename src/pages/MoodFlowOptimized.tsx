import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCrisisDetection } from '../hooks/useCrisisDetection';
import { LazyLoadWrapper } from '../hooks/useLazyLoading';
import { useOptimizedMood } from '../hooks/useOptimizedMood';
import { useDebounce, usePerformanceMonitor } from '../hooks/usePerformance';

// Componentes lazy para mejor rendimiento
const CrisisAlert = React.lazy(() => import('../components/CrisisAlert'));
const LogoutModal = React.lazy(() => import('../components/LogoutModal'));
const MoodAnalysisPanel = React.lazy(() => import('../components/mood/MoodAnalysisPanel'));

// Componente de loading personalizado
const LoadingSpinner: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
  </div>
);

const MoodFlowSimple: React.FC = () => {
  const { user, logout } = useAuth();
  const { createMoodLog, loading: moodLoading, error: moodError } = useOptimizedMood();
  const { currentAssessment, assessMoodData, dismissAlert, contactPsychologist, emergencyContact } =
    useCrisisDetection();

  // Estados optimizados
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
  const [step, setStep] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [moodData, setMoodData] = useState<any>(null);

  const navigate = useNavigate();

  // Monitoreo de rendimiento
  const performanceMetrics = usePerformanceMonitor();

  // Datos estáticos memoizados para evitar re-renders innecesarios
  const moodConfig = useMemo(
    () => ({
      emojis: ['😢', '😕', '😐', '🙂', '😊'],
      labels: ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'],
      colors: [
        'from-red-500 to-red-600',
        'from-orange-500 to-orange-600',
        'from-yellow-500 to-yellow-600',
        'from-green-500 to-green-600',
        'from-blue-500 to-blue-600',
      ],
    }),
    []
  );

  const activityOptions = useMemo(
    () => [
      'Ejercicio',
      'Trabajo',
      'Estudio',
      'Social',
      'Relajación',
      'Hobby',
      'Familia',
      'Música',
      'Lectura',
      'Cocina',
      'Viaje',
      'Deporte',
      'Arte',
      'Tecnología',
      'Naturaleza',
    ],
    []
  );

  const emotionOptions = useMemo(
    () => [
      'Alegría',
      'Tristeza',
      'Enojo',
      'Miedo',
      'Sorpresa',
      'Ansiedad',
      'Calma',
      'Excitación',
      'Nostalgia',
      'Esperanza',
      'Frustración',
      'Gratitud',
      'Soledad',
      'Amor',
      'Confusión',
    ],
    []
  );

  // Debounced feelings para evitar demasiadas actualizaciones
  const debouncedFeelings = useDebounce(feelings, 300);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Callbacks optimizados con useCallback
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleMoodSelect = useCallback((mood: number) => {
    setCurrentMood(mood);
    // Auto-avanzar después de seleccionar mood
    setTimeout(() => setStep(2), 500);
  }, []);

  const handleActivityToggle = useCallback((activity: string) => {
    setActivities((prev) => (prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]));
  }, []);

  const handleEmotionToggle = useCallback((emotion: string) => {
    setEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]));
  }, []);

  const handleFeelingsSubmit = useCallback(async () => {
    if (!currentMood || !feelings.trim()) return;

    try {
      setLoading(true);

      const moodLogData = {
        mood: currentMood,
        feelings: feelings.trim(),
        activities,
        emotions,
        energy,
        stress,
        sleep,
        userId: user?.uid || '',
        createdAt: new Date(),
      };

      const createdLog = await createMoodLog(moodLogData);

      // Evaluar crisis después de crear el log
      await assessMoodData(moodLogData);

      setMoodData(createdLog);
      setShowAnalysis(true);
      setStep(4);
    } catch (error) {
      console.error('Error creating mood log:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMood, feelings, activities, emotions, energy, stress, sleep, user?.uid, createMoodLog, assessMoodData]);

  const handleLogout = useCallback(async () => {
    try {
      setLogoutLoading(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  }, [logout, navigate]);

  const resetFlow = useCallback(() => {
    setCurrentMood(null);
    setFeelings('');
    setActivities([]);
    setEmotions([]);
    setEnergy(5);
    setStress(5);
    setSleep(5);
    setStep(1);
    setShowAnalysis(false);
    setMoodData(null);
  }, []);

  // Renderizado condicional optimizado
  if (!isLoaded) {
    return <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header
        className={`py-6 px-6 transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <Link to='/' className='flex items-center space-x-3 group'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
              <span className='text-white font-black text-lg'>💜</span>
            </div>
            <span
              className={`text-2xl font-black transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              MOOD LOG
            </span>
          </Link>

          <div className='flex items-center space-x-4'>
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      </header>

      {/* Crisis Alert */}
      {currentAssessment && (
        <LazyLoadWrapper>
          <React.Suspense fallback={<LoadingSpinner isDarkMode={isDarkMode} />}>
            <CrisisAlert
              assessment={currentAssessment}
              onDismiss={dismissAlert}
              onContactPsychologist={contactPsychologist}
              onEmergencyContact={emergencyContact}
              isDarkMode={isDarkMode}
            />
          </React.Suspense>
        </LazyLoadWrapper>
      )}

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* Progress Indicator */}
        <div className='mb-8'>
          <div className={`flex items-center justify-between mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepNum
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNum}
                </div>
                <span className='text-xs mt-2 text-center'>
                  {stepNum === 1 && 'MOOD'}
                  {stepNum === 2 && 'SENTIMIENTOS'}
                  {stepNum === 3 && 'DETALLES'}
                  {stepNum === 4 && 'ANÁLISIS'}
                </span>
              </div>
            ))}
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className='h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500'
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div
          className={`rounded-2xl shadow-2xl border transition-all duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Step 1: Mood Selection */}
          {step === 1 && (
            <div className='p-8'>
              <h2
                className={`text-3xl font-black mb-8 text-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                ¿Cómo te sientes hoy?
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                {moodConfig.emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoodSelect(index + 1)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      currentMood === index + 1
                        ? `border-purple-500 bg-gradient-to-r ${moodConfig.colors[index]} text-white shadow-lg`
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className='text-4xl mb-2'>{emoji}</div>
                    <div className='font-bold text-sm'>{moodConfig.labels[index]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Feelings Description */}
          {step === 2 && (
            <div className='p-8'>
              <h2
                className={`text-3xl font-black mb-8 text-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Cuéntanos más sobre tus sentimientos
              </h2>

              <div className='space-y-6'>
                <div>
                  <label
                    className={`block text-lg font-bold mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Describe cómo te sientes:
                  </label>
                  <textarea
                    value={feelings}
                    onChange={(e) => setFeelings(e.target.value)}
                    className={`w-full h-32 px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 resize-none ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder='Escribe aquí cómo te sientes, qué pensamientos tienes, qué te preocupa o qué te hace feliz...'
                  />
                </div>

                <div className='flex justify-end'>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!feelings.trim()}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    }`}
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <div className='p-8'>
              <h2
                className={`text-3xl font-black mb-8 text-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Detalles adicionales
              </h2>

              <div className='space-y-8'>
                {/* Activities */}
                <div>
                  <h3
                    className={`text-xl font-bold mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    ¿Qué actividades realizaste hoy?
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
                    {activityOptions.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => handleActivityToggle(activity)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          activities.includes(activity)
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                            : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotions */}
                <div>
                  <h3
                    className={`text-xl font-bold mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    ¿Qué emociones experimentaste?
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => handleEmotionToggle(emotion)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          emotions.includes(emotion)
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                            : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {[
                    { label: 'Energía', value: energy, setter: setEnergy, emoji: '⚡' },
                    { label: 'Estrés', value: stress, setter: setStress, emoji: '😰' },
                    { label: 'Sueño', value: sleep, setter: setSleep, emoji: '😴' },
                  ].map(({ label, value, setter, emoji }) => (
                    <div key={label}>
                      <label
                        className={`block text-lg font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {emoji} {label}: {value}/10
                      </label>
                      <input
                        type='range'
                        min='1'
                        max='10'
                        value={value}
                        onChange={(e) => setter(parseInt(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${value * 10}%, ${
                            isDarkMode ? '#374151' : '#e5e7eb'
                          } ${value * 10}%, ${isDarkMode ? '#374151' : '#e5e7eb'} 100%)`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className='flex justify-between'>
                  <button
                    onClick={() => setStep(2)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ANTERIOR
                  </button>
                  <button
                    onClick={handleFeelingsSubmit}
                    disabled={loading || moodLoading}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    }`}
                  >
                    {loading || moodLoading ? 'GUARDANDO...' : 'GUARDAR MOOD'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Analysis */}
          {step === 4 && showAnalysis && moodData && (
            <LazyLoadWrapper>
              <React.Suspense fallback={<LoadingSpinner isDarkMode={isDarkMode} />}>
                <MoodAnalysisPanel moodData={moodData} userId={user.uid} isDarkMode={isDarkMode} />
              </React.Suspense>
            </LazyLoadWrapper>
          )}
        </div>

        {/* Action Buttons */}
        <div className='mt-8 flex justify-center space-x-4'>
          <button
            onClick={resetFlow}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            NUEVO MOOD
          </button>
          <Link
            to='/dashboard'
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              isDarkMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            VER DASHBOARD
          </Link>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LazyLoadWrapper>
          <React.Suspense fallback={<LoadingSpinner isDarkMode={isDarkMode} />}>
            <LogoutModal
              isOpen={showLogoutModal}
              onClose={() => setShowLogoutModal(false)}
              onConfirm={handleLogout}
              loading={logoutLoading}
              isDarkMode={isDarkMode}
            />
          </React.Suspense>
        </LazyLoadWrapper>
      )}

      {/* Performance Warning */}
      {performanceMetrics.isSlow && (
        <div className='fixed bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg'>
          ⚠️ Rendimiento lento detectado
        </div>
      )}
    </div>
  );
};

export default MoodFlowSimple;



