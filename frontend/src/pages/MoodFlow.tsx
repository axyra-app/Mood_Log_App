import React, { useState } from 'react';

const MoodFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [moodData, setMoodData] = useState({
    mood: 0,
    energy: 0,
    stress: 0,
    sleep: 0,
    notes: '',
    activities: [] as string[],
    emotions: [] as string[]
  });

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥳', '😍', '🤗'];
  const energyLevels = ['😴', '😑', '😌', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⚡'];
  const stressLevels = ['😌', '😊', '🙂', '😐', '😔', '😟', '😰', '😨', '😱', '💀'];
  const sleepLevels = ['😴', '😑', '😌', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⚡'];

  const activities = [
    '🏃‍♂️ Ejercicio', '📚 Estudio', '💼 Trabajo', '🍽️ Comida', '🎵 Música',
    '📺 TV', '📱 Redes', '👥 Social', '🎮 Juegos', '📖 Lectura',
    '🎨 Arte', '🧘‍♀️ Meditación', '🚶‍♂️ Caminar', '☕ Café', '🍷 Relajación'
  ];

  const emotions = [
    '😊 Feliz', '😢 Triste', '😠 Enojado', '😰 Ansioso', '😌 Tranquilo',
    '🤗 Agradecido', '😔 Melancólico', '😤 Frustrado', '😍 Enamorado', '😴 Cansado',
    '🤩 Emocionado', '😟 Preocupado', '😌 Satisfecho', '😨 Asustado', '😄 Alegre'
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
      ? moodData.activities.filter(a => a !== activity)
      : [...moodData.activities, activity];
    setMoodData({ ...moodData, activities: newActivities });
  };

  const handleEmotionToggle = (emotion: string) => {
    const newEmotions = moodData.emotions.includes(emotion)
      ? moodData.emotions.filter(e => e !== emotion)
      : [...moodData.emotions, emotion];
    setMoodData({ ...moodData, emotions: newEmotions });
  };

  const handleSave = () => {
    console.log('Guardando datos del mood:', moodData);
    // Aquí iría la lógica para guardar en la base de datos
    alert('¡Mood guardado exitosamente! 😊');
  };

  const steps = [
    {
      title: '¿Cómo te sientes hoy?',
      subtitle: 'Selecciona tu estado de ánimo general',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
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
          <div className="text-center text-white/80">
            {moodData.mood > 0 && (
              <p>Seleccionaste: {moodEmojis[moodData.mood - 1]} (Nivel {moodData.mood})</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: '¿Cuál es tu nivel de energía?',
      subtitle: 'Del 1 (muy bajo) al 10 (muy alto)',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
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
          <div className="text-center text-white/80">
            {moodData.energy > 0 && (
              <p>Nivel de energía: {energyLevels[moodData.energy - 1]} ({moodData.energy}/10)</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: '¿Cuánto estrés sientes?',
      subtitle: 'Del 1 (muy relajado) al 10 (muy estresado)',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
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
          <div className="text-center text-white/80">
            {moodData.stress > 0 && (
              <p>Nivel de estrés: {stressLevels[moodData.stress - 1]} ({moodData.stress}/10)</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: '¿Cómo dormiste?',
      subtitle: 'Califica la calidad de tu sueño',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
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
          <div className="text-center text-white/80">
            {moodData.sleep > 0 && (
              <p>Calidad del sueño: {sleepLevels[moodData.sleep - 1]} ({moodData.sleep}/10)</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: '¿Qué actividades hiciste hoy?',
      subtitle: 'Selecciona todas las que apliquen',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
      )
    },
    {
      title: '¿Qué emociones experimentaste?',
      subtitle: 'Selecciona las emociones que sentiste hoy',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
      )
    },
    {
      title: '¿Algo más que quieras agregar?',
      subtitle: 'Escribe notas adicionales sobre tu día',
      content: (
        <div className="space-y-4">
          <textarea
            value={moodData.notes}
            onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
            placeholder="Escribe aquí tus pensamientos, reflexiones o cualquier cosa que quieras recordar sobre este día..."
            className="w-full h-32 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
          />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mood Flow</h1>
          <p className="text-white/80">Rastrea tu bienestar emocional</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/80">{steps[currentStep].subtitle}</p>
          </div>

          {steps[currentStep].content}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
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
                className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-200"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                💾 Guardar Mood
              </button>
            )}
          </div>
        </div>

        {/* Resumen rápido */}
        {moodData.mood > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-2">Resumen de tu mood:</h3>
            <div className="flex justify-between text-white/80 text-sm">
              <span>Mood: {moodEmojis[moodData.mood - 1]} {moodData.mood}/10</span>
              {moodData.energy > 0 && <span>Energía: {moodData.energy}/10</span>}
              {moodData.stress > 0 && <span>Estrés: {moodData.stress}/10</span>}
              {moodData.sleep > 0 && <span>Sueño: {moodData.sleep}/10</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodFlow;
