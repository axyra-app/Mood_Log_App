import { AlertTriangle, Brain, Lightbulb, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { MoodAnalysis } from '../types';

interface AIInsightsProps {
  analysis: MoodAnalysis;
  className?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysis, className = '' }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
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
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className='flex items-center space-x-2 mb-4'>
        <Brain className='w-6 h-6 text-purple-600' />
        <h3 className='text-lg font-semibold text-gray-900'>Análisis de IA</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Estado emocional principal */}
        <div className='space-y-4'>
          <div className='p-4 bg-purple-50 rounded-lg border border-purple-200'>
            <div className='flex items-center space-x-2 mb-2'>
              <div className='text-2xl'>🎭</div>
              <h4 className='font-medium text-gray-900'>Emoción Principal</h4>
            </div>
            <p className='text-lg font-semibold text-purple-600 capitalize'>{analysis.primaryEmotion}</p>
            <div className='flex items-center space-x-2 mt-2'>
              <span className='text-sm text-gray-600'>Confianza:</span>
              <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                {analysis.confidence}%
              </span>
            </div>
          </div>

          {/* Sentimiento */}
          <div className={`p-4 rounded-lg border ${getSentimentColor(analysis.sentiment)}`}>
            <div className='flex items-center space-x-2 mb-2'>
              <TrendingUp className='w-5 h-5' />
              <h4 className='font-medium'>Sentimiento</h4>
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
          <div className={`p-4 rounded-lg border ${getRiskColor(analysis.riskLevel)}`}>
            <div className='flex items-center space-x-2 mb-2'>
              <AlertTriangle className='w-5 h-5' />
              <h4 className='font-medium'>Nivel de Riesgo</h4>
            </div>
            <p className='text-lg font-semibold capitalize'>
              {analysis.riskLevel === 'low' ? 'Bajo' : analysis.riskLevel === 'medium' ? 'Medio' : 'Alto'}
            </p>
          </div>
        </div>

        {/* Sugerencias y recomendaciones */}
        <div className='space-y-4'>
          {/* Sugerencias */}
          <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <div className='flex items-center space-x-2 mb-3'>
              <Lightbulb className='w-5 h-5 text-blue-600' />
              <h4 className='font-medium text-gray-900'>Sugerencias</h4>
            </div>
            <ul className='space-y-2'>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <span className='text-blue-600 mt-1'>•</span>
                  <span className='text-sm text-gray-700'>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recomendaciones */}
          <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-center space-x-2 mb-3'>
              <Target className='w-5 h-5 text-green-600' />
              <h4 className='font-medium text-gray-900'>Recomendaciones</h4>
            </div>
            <ul className='space-y-2'>
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <span className='text-green-600 mt-1'>•</span>
                  <span className='text-sm text-gray-700'>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Patrones identificados */}
      {analysis.patterns && analysis.patterns.length > 0 && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex items-center space-x-2 mb-3'>
            <div className='text-xl'>🔍</div>
            <h4 className='font-medium text-gray-900'>Patrones Identificados</h4>
          </div>
          <ul className='space-y-1'>
            {analysis.patterns.map((pattern, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <span className='text-gray-600 mt-1'>•</span>
                <span className='text-sm text-gray-700'>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estado emocional detallado */}
      {analysis.emotionalState && (
        <div className='mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
          <div className='flex items-center space-x-2 mb-2'>
            <div className='text-xl'>💭</div>
            <h4 className='font-medium text-gray-900'>Estado Emocional</h4>
          </div>
          <p className='text-sm text-gray-700'>{analysis.emotionalState}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
