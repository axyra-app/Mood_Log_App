import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MoodFlowSimple: React.FC = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [feelings, setFeelings] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: mood selection, 2: feelings description
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

  const handleFeelingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMood) return;

    setLoading(true);

    try {
      // Simular análisis con IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular guardado exitoso
      const moodData = {
        mood: currentMood,
        feelings: feelings,
        timestamp: new Date(),
        aiAnalysis: {
          primaryEmotion: feelings ? 'Emoción positiva detectada' : 'Estado de ánimo registrado',
          confidence: 85,
          suggestions: feelings ? [
            'Considera practicar ejercicios de respiración',
            'Mantén una rutina de sueño regular',
            'Conecta con personas que te hagan sentir bien'
          ] : [
            'Registra tus sentimientos para obtener análisis más detallados',
            'Mantén un registro diario para identificar patrones'
          ]
        }
      };

      // Guardar en localStorage para simular persistencia
      const today = new Date().toDateString();
      const userKey = `moodLogs_${user?.uid}`;
      const existingData = JSON.parse(localStorage.getItem(userKey) || '{}');
      existingData[today] = moodData;
      localStorage.setItem(userKey, JSON.stringify(existingData));

      // Mostrar análisis de IA
      alert(`¡Mood guardado exitosamente! 😊\n\nAnálisis de IA: ${moodData.aiAnalysis.primaryEmotion} (${moodData.aiAnalysis.confidence}% confianza)\n\nSugerencias:\n${moodData.aiAnalysis.suggestions.join('\n• ')}`);
      
      // Redirigir al dashboard
      navigate('/dashboard');
      
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
      // Simular guardado sin descripción
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const moodData = {
        mood: currentMood,
        feelings: '',
        timestamp: new Date(),
        aiAnalysis: {
          primaryEmotion: 'Estado de ánimo registrado',
          confidence: 70,
          suggestions: [
            'Registra tus sentimientos para obtener análisis más detallados',
            'Mantén un registro diario para identificar patrones'
          ]
        }
      };

      // Guardar en localStorage
      const today = new Date().toDateString();
      const userKey = `moodLogs_${user?.uid}`;
      const existingData = JSON.parse(localStorage.getItem(userKey) || '{}');
      existingData[today] = moodData;
      localStorage.setItem(userKey, JSON.stringify(existingData));

      alert(`¡Mood guardado exitosamente! 😊\n\nAnálisis de IA: ${moodData.aiAnalysis.primaryEmotion} (${moodData.aiAnalysis.confidence}% confianza)`);
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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
          </div>
          <div className="text-center mt-4">
            <p className={`text-lg font-bold transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {step === 1 ? 'PASO 1: SELECCIONA TU ESTADO DE ÁNIMO' : 'PASO 2: DESCRIBE TUS SENTIMIENTOS (OPCIONAL)'}
            </p>
          </div>
        </div>

        {step === 1 ? (
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
        ) : (
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

            <form onSubmit={handleFeelingsSubmit} className="max-w-2xl mx-auto">
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
                  onClick={handleSkipFeelings}
                  disabled={loading}
                  className={`flex-1 py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Guardando...' : 'Omitir y Guardar'}
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
      </div>
    </div>
  );
};

export default MoodFlowSimple;
