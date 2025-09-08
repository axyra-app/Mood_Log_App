import { ArrowLeft, Brain, Lightbulb, Loader2, Sparkles, Target } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';
import { saveMoodLog } from '../services/firestore';
import { MoodAnalysis, analyzeMoodWithAI } from '../services/openai';

const MoodFlow: React.FC = () => {
  const { user } = useAuth();
  const { saveMoodLog: saveMoodHook } = useMood();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<MoodAnalysis | null>(null);
  const [moodData, setMoodData] = useState({
    mood: 0,
    energy: 0,
    stress: 0,
    sleep: 0,
    notes: '',
    activities: [] as string[],
    emotions: [] as string[],
  });

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const energyLevels = ['😴', '😑', '😌', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⚡'];
  const stressLevels = ['😌', '😊', '🙂', '😐', '😔', '😟', '😰', '😨', '😱', '💀'];
  const sleepLevels = ['😴', '😑', '😌', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⚡'];

  const activities = [
    '🏃‍♂️ Ejercicio',
    '📚 Estudio',
    '💼 Trabajo',
    '🍽️ Comida',
    '🎵 Música',
    '📺 TV',
    '📱 Redes',
    '👥 Social',
    '🎮 Juegos',
    '📖 Lectura',
    '🎨 Arte',
    '🧘‍♀️ Meditación',
    '🚶‍♂️ Caminar',
    '☕ Café',
    '🍷 Relajación',
  ];

  const emotions = [
    '😊 Feliz',
    '😢 Triste',
    '😠 Enojado',
    '😰 Ansioso',
    '😌 Tranquilo',
    '🤗 Agradecido',
    '😔 Melancólico',
    '😤 Frustrado',
    '😍 Enamorado',
    '😴 Cansado',
    '🤩 Emocionado',
    '😟 Preocupado',
    '😌 Satisfecho',
    '😨 Asustado',
    '😄 Alegre',
  ];

  const handleMoodSelect = (value: number) => {
    setMoodData({ ...moodData, mood: value });
  };

  const handleEnergySelect = (value: number) => {
    setMoodData({ ...moodData, energy: value });
  };

  const handleStressSelect = (value: number) => {
    setMoodData({ ...moodData, stress: value });
  };

  const handleSleepSelect = (value: number) => {
    setMoodData({ ...moodData, sleep: value });
  };

  const handleActivityToggle = (activity: string) => {
    const newActivities = moodData.activities.includes(activity)
      ? moodData.activities.filter((a) => a !== activity)
      : [...moodData.activities, activity];
    setMoodData({ ...moodData, activities: newActivities });
  };

  const handleEmotionToggle = (emotion: string) => {
    const newEmotions = moodData.emotions.includes(emotion)
      ? moodData.emotions.filter((e) => e !== emotion)
      : [...moodData.emotions, emotion];
    setMoodData({ ...moodData, emotions: newEmotions });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Análisis con IA
      const analysis = await analyzeMoodWithAI(moodData);
      setAiAnalysis(analysis);

      // Guardar en Firestore
      const moodLogData = {
        userId: user.uid,
        ...moodData,
        aiAnalysis: analysis,
      };

      await saveMoodLog(moodLogData);

      // Mostrar mensaje de éxito
      alert('¡Mood guardado exitosamente! 😊');

      // Resetear formulario
      setMoodData({
        mood: 0,
        energy: 0,
        stress: 0,
        sleep: 0,
        notes: '',
        activities: [],
        emotions: [],
      });
      setCurrentStep(0);
      setAiAnalysis(null);
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '¿Cómo te sientes hoy?',
      subtitle: 'Selecciona tu estado de ánimo general',
      content: (
        <div className='space-y-6'>
          <div className='grid grid-cols-5 gap-4'>
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(index + 1)}
                className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                  moodData.mood === index + 1
                    ? 'bg-purple-500 text-white scale-110 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className='text-center text-white/80'>
            {moodData.mood > 0 && (
              <p>
                Seleccionaste: {moodEmojis[moodData.mood - 1]} (Nivel {moodData.mood})
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '¿Cuál es tu nivel de energía?',
      subtitle: 'Del 1 (muy bajo) al 10 (muy alto)',
      content: (
        <div className='space-y-6'>
          <div className='grid grid-cols-5 gap-4'>
            {energyLevels.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEnergySelect(index + 1)}
                className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                  moodData.energy === index + 1
                    ? 'bg-blue-500 text-white scale-110 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className='text-center text-white/80'>
            {moodData.energy > 0 && (
              <p>
                Nivel de energía: {energyLevels[moodData.energy - 1]} ({moodData.energy}/10)
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '¿Cuánto estrés sientes?',
      subtitle: 'Del 1 (muy relajado) al 10 (muy estresado)',
      content: (
        <div className='space-y-6'>
          <div className='grid grid-cols-5 gap-4'>
            {stressLevels.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleStressSelect(index + 1)}
                className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                  moodData.stress === index + 1
                    ? 'bg-red-500 text-white scale-110 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className='text-center text-white/80'>
            {moodData.stress > 0 && (
              <p>
                Nivel de estrés: {stressLevels[moodData.stress - 1]} ({moodData.stress}/10)
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '¿Cómo dormiste?',
      subtitle: 'Califica la calidad de tu sueño',
      content: (
        <div className='space-y-6'>
          <div className='grid grid-cols-5 gap-4'>
            {sleepLevels.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleSleepSelect(index + 1)}
                className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                  moodData.sleep === index + 1
                    ? 'bg-indigo-500 text-white scale-110 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className='text-center text-white/80'>
            {moodData.sleep > 0 && (
              <p>
                Calidad del sueño: {sleepLevels[moodData.sleep - 1]} ({moodData.sleep}/10)
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '¿Qué actividades hiciste hoy?',
      subtitle: 'Selecciona todas las que apliquen',
      content: (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            {activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleActivityToggle(activity)}
                className={`p-3 rounded-xl text-sm transition-all duration-200 ${
                  moodData.activities.includes(activity)
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '¿Qué emociones experimentaste?',
      subtitle: 'Selecciona las emociones que sentiste hoy',
      content: (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            {emotions.map((emotion, index) => (
              <button
                key={index}
                onClick={() => handleEmotionToggle(emotion)}
                className={`p-3 rounded-xl text-sm transition-all duration-200 ${
                  moodData.emotions.includes(emotion)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '¿Algo más que quieras agregar?',
      subtitle: 'Escribe notas adicionales sobre tu día',
      content: (
        <div className='space-y-4'>
          <textarea
            value={moodData.notes}
            onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
            placeholder='Escribe aquí tus pensamientos, reflexiones o cualquier cosa que quieras recordar sobre este día...'
            className='w-full h-32 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none'
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO
        title='Mood Flow - Mood Log App'
        description='Registra tu estado de ánimo con análisis de IA en tiempo real'
        keywords='mood tracking, análisis emocional, IA, bienestar'
      />

      <div className='min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4'>
        <div className='max-w-2xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <Link to='/dashboard' className='inline-flex items-center text-white hover:text-white/80 transition-colors'>
              <ArrowLeft className='w-5 h-5 mr-2' />
              Volver al Dashboard
            </Link>
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-white mb-2'>Mood Flow</h1>
              <p className='text-white/80'>Rastrea tu bienestar emocional</p>
            </div>
            <div className='w-20'></div> {/* Spacer */}
          </div>

          {/* Progress Bar */}
          <div className='mb-8'>
            <div className='flex justify-between text-white/70 text-sm mb-2'>
              <span>
                Paso {currentStep + 1} de {steps.length}
              </span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className='w-full bg-white/20 rounded-full h-2'>
              <div
                className='bg-white h-2 rounded-full transition-all duration-300'
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card principal */}
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-semibold text-white mb-2'>{steps[currentStep].title}</h2>
              <p className='text-white/80'>{steps[currentStep].subtitle}</p>
            </div>

            {steps[currentStep].content}

            {/* Navigation */}
            <div className='flex justify-between mt-8'>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentStep === 0
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                ← Anterior
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className='bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-200'
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className='bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                >
                  {loading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Analizando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className='w-5 h-5' />
                      <span>Guardar con IA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className='mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20'>
              <div className='flex items-center space-x-2 mb-4'>
                <Brain className='w-6 h-6 text-purple-300' />
                <h3 className='text-white font-semibold'>Análisis de IA</h3>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-white/80'>Emoción principal:</span>
                  <span className='text-white font-medium'>{aiAnalysis.primaryEmotion}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-white/80'>Confianza:</span>
                  <span className='text-white font-medium'>{aiAnalysis.confidence}%</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-white/80'>Sentimiento:</span>
                  <span
                    className={`font-medium ${
                      aiAnalysis.sentiment === 'positive'
                        ? 'text-green-300'
                        : aiAnalysis.sentiment === 'negative'
                        ? 'text-red-300'
                        : 'text-yellow-300'
                    }`}
                  >
                    {aiAnalysis.sentiment === 'positive'
                      ? 'Positivo'
                      : aiAnalysis.sentiment === 'negative'
                      ? 'Negativo'
                      : 'Neutral'}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-white/80'>Nivel de riesgo:</span>
                  <span
                    className={`font-medium ${
                      aiAnalysis.riskLevel === 'low'
                        ? 'text-green-300'
                        : aiAnalysis.riskLevel === 'medium'
                        ? 'text-yellow-300'
                        : 'text-red-300'
                    }`}
                  >
                    {aiAnalysis.riskLevel === 'low' ? 'Bajo' : aiAnalysis.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                  </span>
                </div>
              </div>

              <div className='mt-4 space-y-3'>
                <div>
                  <h4 className='text-white font-medium mb-2 flex items-center space-x-2'>
                    <Lightbulb className='w-4 h-4' />
                    <span>Sugerencias</span>
                  </h4>
                  <ul className='space-y-1'>
                    {aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className='text-white/80 text-sm'>
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className='text-white font-medium mb-2 flex items-center space-x-2'>
                    <Target className='w-4 h-4' />
                    <span>Recomendaciones</span>
                  </h4>
                  <ul className='space-y-1'>
                    {aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className='text-white/80 text-sm'>
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Resumen rápido */}
          {moodData.mood > 0 && (
            <div className='mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20'>
              <h3 className='text-white font-semibold mb-2'>Resumen de tu mood:</h3>
              <div className='flex justify-between text-white/80 text-sm'>
                <span>
                  Mood: {moodEmojis[moodData.mood - 1]} {moodData.mood}/5
                </span>
                {moodData.energy > 0 && <span>Energía: {moodData.energy}/10</span>}
                {moodData.stress > 0 && <span>Estrés: {moodData.stress}/10</span>}
                {moodData.sleep > 0 && <span>Sueño: {moodData.sleep}/10</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MoodFlow;
