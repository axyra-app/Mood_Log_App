import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOptimizedMood } from '../hooks/useOptimizedMood';
import LogoutModal from '../components/LogoutModal';

const MoodFlowSimple: React.FC = () => {
  const { user, logout } = useAuth();
  const { createMoodLog, loading: moodLoading, error: moodError } = useOptimizedMood();
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
  const [step, setStep] = useState(1); // 1: mood selection, 2: feelings description, 3: additional details
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];
  const moodColors = [
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600', 
    'from-yellow-500 to-yellow-600',
    'from-green-500 to-green-600',
    'from-blue-500 to-blue-600'
  ];

  const activityOptions = [
    'Ejercicio', 'Trabajo', 'Estudio', 'Social', 'Relajación', 
    'Hobby', 'Familia', 'Música', 'Lectura', 'Naturaleza'
  ];

  const emotionOptions = [
    'Felicidad', 'Tristeza', 'Ansiedad', 'Tranquilidad', 'Enojo',
    'Gratitud', 'Miedo', 'Esperanza', 'Frustración', 'Paz'
  ];

  useEffect(() => {
    setIsLoaded(true);
    // Reset form when component mounts
    setCurrentMood(null);
    setFeelings('');
    setActivities([]);
    setEmotions([]);
    setEnergy(5);
    setStress(5);
    setSleep(5);
    setStep(1);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMoodSelect = (mood: number) => {
    setCurrentMood(mood);
    setStep(2);
  };

  const handleActivityToggle = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleEmotionToggle = (emotion: string) => {
    setEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleFeelingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMood) return;

    setLoading(true);

    try {
      const moodData = {
        mood: currentMood,
        notes: feelings,
        activities,
        emotions,
        energy,
        stress,
        sleep,
      };

      await createMoodLog(moodData);

      // Mostrar mensaje de éxito y redirigir
      alert('¡Estado de ánimo guardado exitosamente!');
      // Redirigir al dashboard del usuario según su rol
      if (user?.role === 'psychologist') {
        navigate('/dashboard-psychologist');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipFeelings = async () => {
    if (!currentMood) return;

    setLoading(true);

    try {
      const moodData = {
        mood: currentMood,
        notes: '',
        activities,
        emotions,
        energy,
        stress,
        sleep,
      };

      await createMoodLog(moodData);

      // Mostrar mensaje de éxito y redirigir
      alert('¡Estado de ánimo guardado exitosamente!');
      // Redirigir al dashboard del usuario según su rol
      if (user?.role === 'psychologist') {
        navigate('/dashboard-psychologist');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };


  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`py-6 px-6 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-lg border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-lg">💜</span>
            </div>
            <span className={`text-2xl font-black transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              MOOD LOG
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
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
            <Link
              to="/dashboard"
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogoutClick}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/25'
              }`}
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${
              step >= 1 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 transition-all duration-300 ${
              step >= 2 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : isDarkMode 
                  ? 'bg-gray-700' 
                  : 'bg-gray-200'
            }`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${
              step >= 2 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 transition-all duration-300 ${
              step >= 3 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : isDarkMode 
                  ? 'bg-gray-700' 
                  : 'bg-gray-200'
            }`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${
              step >= 3 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
          <div className="text-center mt-4">
            <p className={`text-lg font-bold transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {step === 1 ? 'PASO 1: SELECCIONA TU ESTADO DE ÁNIMO' : 
               step === 2 ? 'PASO 2: DESCRIBE TUS SENTIMIENTOS' : 
               'PASO 3: DETALLES ADICIONALES'}
            </p>
          </div>
        </div>

        {step === 1 && (
          /* Step 1: Mood Selection */
          <div className="text-center">
            <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ¿CÓMO TE SIENTES HOY?
            </h1>
            <p className={`text-xl mb-12 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Selecciona el emoji que mejor represente tu estado de ánimo actual
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  className={`p-8 rounded-2xl border-4 transition-all duration-300 hover:scale-105 ${
                    currentMood === index + 1
                      ? `bg-gradient-to-r ${moodColors[index]} border-transparent scale-110 shadow-2xl`
                      : `border-transparent hover:border-purple-500 ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`
                  }`}
                >
                  <div className="text-6xl mb-4">{emoji}</div>
                  <p className={`text-lg font-bold transition-colors duration-500 ${
                    currentMood === index + 1
                      ? 'text-white'
                      : isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                  }`}>
                    {moodLabels[index]}
                  </p>
                </button>
              ))}
            </div>

            {currentMood && (
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <p className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Seleccionaste: {moodLabels[currentMood - 1]} {moodEmojis[currentMood - 1]}
                </p>
                <p className={`text-lg mt-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ¡Perfecto! Ahora puedes describir cómo te sientes (opcional)
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          /* Step 2: Feelings Description */
          <div className="text-center">
            <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              DESCRIBE TUS SENTIMIENTOS
            </h1>
            <p className={`text-xl mb-8 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cuéntanos más sobre cómo te sientes. La IA analizará tus palabras y te dará sugerencias personalizadas.
            </p>

            <div className={`p-6 rounded-2xl border-2 mb-8 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-4xl">{moodEmojis[currentMood! - 1]}</div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {moodLabels[currentMood! - 1]}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="max-w-2xl mx-auto">
              <textarea
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                placeholder="Describe cómo te sientes hoy... ¿Qué está pasando en tu vida? ¿Qué emociones experimentas? ¿Hay algo específico que te preocupa o te hace feliz?"
                className={`w-full h-48 p-6 rounded-2xl border-2 resize-none transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                }`}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`flex-1 py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Omitir y Continuar
                </button>
                
                <button
                  type="submit"
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg uppercase tracking-wider py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50`}
                >
                  Continuar
                </button>
              </div>
            </form>

            <div className="mt-8">
              <button
                onClick={() => setStep(1)}
                className={`text-lg font-bold transition-colors duration-300 hover:underline ${
                  isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                ← Volver a seleccionar mood
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          /* Step 3: Additional Details */
          <div className="text-center">
            <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              DETALLES ADICIONALES
            </h1>
            <p className={`text-xl mb-8 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Ayúdanos a entender mejor tu día con algunos detalles adicionales
            </p>

            {/* Activities */}
            <div className={`p-6 rounded-2xl border-2 mb-8 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ¿Qué actividades realizaste hoy?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {activityOptions.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => handleActivityToggle(activity)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      activities.includes(activity)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-purple-500'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div className={`p-6 rounded-2xl border-2 mb-8 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ¿Qué emociones experimentaste?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {emotionOptions.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionToggle(emotion)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      emotions.includes(emotion)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-purple-500'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy, Stress, Sleep */}
            <div className={`p-6 rounded-2xl border-2 mb-8 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Evalúa tu día
              </h3>
              
              <div className="space-y-6">
                {/* Energy */}
                <div>
                  <label className={`text-lg font-bold block mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Nivel de Energía: {energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Stress */}
                <div>
                  <label className={`text-lg font-bold block mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Nivel de Estrés: {stress}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stress}
                    onChange={(e) => setStress(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Sleep */}
                <div>
                  <label className={`text-lg font-bold block mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Calidad del Sueño: {sleep}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleFeelingsSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleSkipFeelings}
                  disabled={loading}
                  className={`flex-1 py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Guardando...' : 'Guardar sin IA'}
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg uppercase tracking-wider py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin text-xl">⚡</div>
                      <span>Analizando con IA...</span>
                    </div>
                  ) : (
                    'Analizar con IA y Guardar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <button
                onClick={() => setStep(2)}
                className={`text-lg font-bold transition-colors duration-300 hover:underline ${
                  isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                ← Volver a sentimientos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isDarkMode={isDarkMode}
        loading={logoutLoading}
      />
    </div>
  );
};

export default MoodFlowSimple;