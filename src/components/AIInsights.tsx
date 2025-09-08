import { AlertTriangle, Brain, Lightbulb, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { MoodAnalysis } from '../types';

interface AIInsightsProps {
  analysis: MoodAnalysis;
  className?: string;
  isDarkMode?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysis, className = '', isDarkMode = false }) => {
  const getSentimentColor = (sentiment: string) => {
    if (isDarkMode) {
      switch (sentiment) {
        case 'positive':
          return 'text-green-400 bg-green-900/20 border-green-700';
        case 'negative':
          return 'text-red-400 bg-red-900/20 border-red-700';
        default:
          return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      }
    } else {
      switch (sentiment) {
        case 'positive':
          return 'text-green-600 bg-green-50 border-green-200';
        case 'negative':
          return 'text-red-600 bg-red-50 border-red-200';
        default:
          return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      }
    }
  };

  const getRiskColor = (riskLevel: string) => {
    if (isDarkMode) {
      switch (riskLevel) {
        case 'low':
          return 'text-green-400 bg-green-900/20 border-green-700';
        case 'medium':
          return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
        case 'high':
          return 'text-red-400 bg-red-900/20 border-red-700';
        default:
          return 'text-gray-400 bg-gray-900/20 border-gray-700';
      }
    } else {
      switch (riskLevel) {
        case 'low':
          return 'text-green-600 bg-green-50 border-green-200';
        case 'medium':
          return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'high':
          return 'text-red-600 bg-red-50 border-red-200';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (isDarkMode) {
      if (confidence >= 80) return 'text-green-400';
      if (confidence >= 60) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (confidence >= 80) return 'text-green-600';
      if (confidence >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border-2 p-6 transition-all duration-300 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
          : 'bg-white border-gray-200 hover:border-purple-500'
      } ${className}`}
    >
      <div className='flex items-center space-x-2 mb-4'>
        <Brain className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Análisis de IA</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Estado emocional principal */}
        <div className='space-y-4'>
          <div
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-purple-900/20 border-purple-700 hover:border-purple-500'
                : 'bg-purple-50 border-purple-200 hover:border-purple-500'
            }`}
          >
            <div className='flex items-center space-x-2 mb-2'>
              <div className='text-2xl'>🎭</div>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Emoción Principal</h4>
            </div>
            <p className={`text-lg font-semibold capitalize ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {analysis.primaryEmotion}
            </p>
            <div className='flex items-center space-x-2 mt-2'>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confianza:</span>
              <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                {analysis.confidence}%
              </span>
            </div>
          </div>

          {/* Sentimiento */}
          <div
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${getSentimentColor(analysis.sentiment)}`}
          >
            <div className='flex items-center space-x-2 mb-2'>
              <TrendingUp className='w-5 h-5' />
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sentimiento</h4>
            </div>
            <p className='text-lg font-semibold capitalize'>
              {analysis.sentiment === 'positive'
                ? 'Positivo'
                : analysis.sentiment === 'negative'
                ? 'Negativo'
                : 'Neutral'}
            </p>
          </div>

          {/* Nivel de riesgo */}
          <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getRiskColor(analysis.riskLevel)}`}>
            <div className='flex items-center space-x-2 mb-2'>
              <AlertTriangle className='w-5 h-5' />
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nivel de Riesgo</h4>
            </div>
            <p className='text-lg font-semibold capitalize'>
              {analysis.riskLevel === 'low' ? 'Bajo' : analysis.riskLevel === 'medium' ? 'Medio' : 'Alto'}
            </p>
          </div>
        </div>

        {/* Sugerencias y recomendaciones */}
        <div className='space-y-4'>
          {/* Sugerencias */}
          <div
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-blue-900/20 border-blue-700 hover:border-blue-500'
                : 'bg-blue-50 border-blue-200 hover:border-blue-500'
            }`}
          >
            <div className='flex items-center space-x-2 mb-3'>
              <Lightbulb className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sugerencias</h4>
            </div>
            <ul className='space-y-2'>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <span className={`mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recomendaciones */}
          <div
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-green-900/20 border-green-700 hover:border-green-500'
                : 'bg-green-50 border-green-200 hover:border-green-500'
            }`}
          >
            <div className='flex items-center space-x-2 mb-3'>
              <Target className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones</h4>
            </div>
            <ul className='space-y-2'>
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <span className={`mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>•</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Patrones identificados */}
      {analysis.patterns && analysis.patterns.length > 0 && (
        <div
          className={`mt-6 p-4 rounded-lg border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center space-x-2 mb-3'>
            <div className='text-xl'>🔍</div>
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Patrones Identificados</h4>
          </div>
          <ul className='space-y-1'>
            {analysis.patterns.map((pattern, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <span className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>•</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estado emocional detallado */}
      {analysis.emotionalState && (
        <div
          className={`mt-6 p-4 rounded-lg border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700 hover:border-purple-500'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-500'
          }`}
        >
          <div className='flex items-center space-x-2 mb-2'>
            <div className='text-xl'>💭</div>
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estado Emocional</h4>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{analysis.emotionalState}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
