import React from 'react';
import Modal from './Modal';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  mood: number;
  feelings: string;
  isDarkMode?: boolean;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  mood, 
  feelings, 
  isDarkMode = false 
}) => {
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];
  
  // Análisis de IA más realista basado en el mood y sentimientos
  const getAIAnalysis = () => {
    const analysis = {
      primaryEmotion: '',
      confidence: 0,
      suggestions: [] as string[],
      insights: [] as string[],
      color: ''
    };

    if (mood === 1) { // Muy mal
      analysis.primaryEmotion = 'Tristeza profunda';
      analysis.confidence = 92;
      analysis.color = 'from-red-500 to-red-600';
      analysis.suggestions = [
        'Considera hablar con un profesional de la salud mental',
        'Practica ejercicios de respiración profunda',
        'Conecta con personas de confianza',
        'Realiza actividades que te gusten'
      ];
      analysis.insights = [
        'Es normal sentirse así a veces',
        'Recuerda que los sentimientos son temporales',
        'Buscar ayuda es una señal de fortaleza'
      ];
    } else if (mood === 2) { // Mal
      analysis.primaryEmotion = 'Melancolía';
      analysis.confidence = 88;
      analysis.color = 'from-orange-500 to-orange-600';
      analysis.suggestions = [
        'Sal a caminar al aire libre',
        'Escucha música que te anime',
        'Practica gratitud diaria',
        'Mantén una rutina de sueño regular'
      ];
      analysis.insights = [
        'Los días difíciles son parte del crecimiento',
        'Pequeños cambios pueden mejorar tu estado de ánimo'
      ];
    } else if (mood === 3) { // Regular
      analysis.primaryEmotion = 'Neutralidad';
      analysis.confidence = 85;
      analysis.color = 'from-yellow-500 to-yellow-600';
      analysis.suggestions = [
        'Identifica qué te haría sentir mejor',
        'Prueba una nueva actividad',
        'Conecta con amigos o familia',
        'Establece una meta pequeña para hoy'
      ];
      analysis.insights = [
        'Un día regular puede ser el inicio de algo mejor',
        'La estabilidad emocional es valiosa'
      ];
    } else if (mood === 4) { // Bien
      analysis.primaryEmotion = 'Satisfacción';
      analysis.confidence = 90;
      analysis.color = 'from-green-500 to-green-600';
      analysis.suggestions = [
        'Aprovecha esta energía positiva',
        'Ayuda a alguien más a sentirse bien',
        'Documenta qué te hizo sentir así',
        'Mantén hábitos saludables'
      ];
      analysis.insights = [
        '¡Excelente! Estás en un buen momento',
        'Aprovecha esta positividad para construir hábitos'
      ];
    } else { // Excelente
      analysis.primaryEmotion = 'Euforia positiva';
      analysis.confidence = 95;
      analysis.color = 'from-blue-500 to-blue-600';
      analysis.suggestions = [
        '¡Comparte esta felicidad con otros!',
        'Aprovecha para hacer algo que siempre quisiste',
        'Graba este momento en tu memoria',
        'Usa esta energía para ayudar a otros'
      ];
      analysis.insights = [
        '¡Qué maravilloso! Estás en tu mejor momento',
        'Esta energía positiva es contagiosa'
      ];
    }

    // Análisis adicional basado en los sentimientos escritos
    if (feelings) {
      const feelingsLower = feelings.toLowerCase();
      
      if (feelingsLower.includes('trabajo') || feelingsLower.includes('trabajando')) {
        analysis.suggestions.push('El trabajo puede ser una fuente de satisfacción personal');
      }
      if (feelingsLower.includes('familia') || feelingsLower.includes('amigos')) {
        analysis.suggestions.push('Las relaciones personales son fundamentales para el bienestar');
      }
      if (feelingsLower.includes('estrés') || feelingsLower.includes('estresado')) {
        analysis.suggestions.push('Considera técnicas de relajación y manejo del estrés');
      }
      if (feelingsLower.includes('feliz') || feelingsLower.includes('contento')) {
        analysis.insights.push('Tu descripción refleja una actitud muy positiva');
      }
    }

    return analysis;
  };

  const analysis = getAIAnalysis();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🧠 ANÁLISIS DE IA"
      isDarkMode={isDarkMode}
    >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
        {/* Mood Display */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${analysis.color} text-white text-center`}>
          <div className="text-4xl mb-3">{moodEmojis[mood - 1]}</div>
          <h3 className="text-xl font-black mb-2">{moodLabels[mood - 1]}</h3>
          <p className="text-sm opacity-90">Estado de ánimo registrado</p>
        </div>

        {/* AI Analysis */}
        <div className={`p-4 rounded-2xl border-2 ${
          isDarkMode
            ? 'bg-gray-800 border-purple-500'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            📊 ANÁLISIS DETALLADO
          </h4>
          <div className="space-y-2">
            <div>
              <span className={`font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Emoción principal:
              </span>
              <span className={`ml-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {analysis.primaryEmotion}
              </span>
            </div>
            <div>
              <span className={`font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Confianza del análisis:
              </span>
              <span className={`ml-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {analysis.confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Insights */}
        {analysis.insights.length > 0 && (
          <div className={`p-4 rounded-2xl border-2 ${
            isDarkMode
              ? 'bg-gray-800 border-blue-500'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              💡 INSIGHTS PERSONALIZADOS
            </h4>
            <ul className="space-y-1">
              {analysis.insights.map((insight, index) => (
                <li key={index} className={`flex items-start space-x-3 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        <div className={`p-4 rounded-2xl border-2 ${
          isDarkMode
            ? 'bg-gray-800 border-green-500'
            : 'bg-green-50 border-green-200'
        }`}>
          <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            🎯 SUGERENCIAS PERSONALIZADAS
          </h4>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className={`flex items-start space-x-3 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="text-green-500 mt-1 font-bold">{index + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Feelings Analysis */}
        {feelings && (
          <div className={`p-4 rounded-2xl border-2 ${
            isDarkMode
              ? 'bg-gray-800 border-pink-500'
              : 'bg-pink-50 border-pink-200'
          }`}>
            <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              📝 ANÁLISIS DE TUS PALABRAS
            </h4>
            <p className={`text-sm italic transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "{feelings}"
            </p>
            <p className={`mt-2 text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Tu descripción muestra una actitud reflexiva y consciente de tus emociones. 
              Esto es una excelente base para el crecimiento personal.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIAnalysisModal;
