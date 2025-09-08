import {
  BarChart3,
  Brain,
  ChevronDown,
  ChevronUp,
  Heart,
  Lightbulb,
  Minus,
  PieChart,
  Shield,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface AdvancedAIInsightsProps {
  insights: string[];
  longTermTrends?: any;
  moodStatistics?: any;
  isDarkMode?: boolean;
}

const AdvancedAIInsights: React.FC<AdvancedAIInsightsProps> = ({
  insights,
  longTermTrends,
  moodStatistics,
  isDarkMode = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insights: true,
    trends: false,
    patterns: false,
    recommendations: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className='w-5 h-5 text-green-500' />;
      case 'declining':
        return <TrendingDown className='w-5 h-5 text-red-500' />;
      default:
        return <Minus className='w-5 h-5 text-gray-500' />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInsightIcon = (index: number) => {
    const icons = [Lightbulb, Brain, Heart, Zap, Star];
    const Icon = icons[index % icons.length];
    return <Icon className='w-5 h-5' />;
  };

  const getInsightColor = (index: number) => {
    const colors = ['text-yellow-500', 'text-purple-500', 'text-pink-500', 'text-blue-500', 'text-green-500'];
    return colors[index % colors.length];
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className='text-center'>
        <div className='flex items-center justify-center space-x-3 mb-4'>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
            }`}
          >
            <Brain className='w-6 h-6 text-white' />
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ANÁLISIS INTELIGENTE</h2>
        </div>
        <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Insights personalizados basados en tu historial emocional
        </p>
      </div>

      {/* Insights Principales */}
      <div
        className={`rounded-2xl border-2 transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
            : 'bg-white border-gray-200 hover:border-purple-500'
        }`}
      >
        <button
          onClick={() => toggleSection('insights')}
          className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-300 ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}
        >
          <div className='flex items-center space-x-3'>
            <Lightbulb className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              INSIGHTS PERSONALIZADOS
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {insights.length}
            </span>
          </div>
          {expandedSections.insights ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
        </button>

        {expandedSections.insights && (
          <div className='px-6 pb-6 space-y-4'>
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 hover:border-purple-400'
                    : 'bg-gray-50 border-gray-200 hover:border-purple-400'
                }`}
              >
                <div className='flex items-start space-x-3'>
                  <div className={`flex-shrink-0 ${getInsightColor(index)}`}>{getInsightIcon(index)}</div>
                  <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {insight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tendencias a Largo Plazo */}
      {longTermTrends && (
        <div
          className={`rounded-2xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
              : 'bg-white border-gray-200 hover:border-blue-500'
          }`}
        >
          <button
            onClick={() => toggleSection('trends')}
            className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-300 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center space-x-3'>
              <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                TENDENCIAS A LARGO PLAZO
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {longTermTrends.overallTrend}
              </span>
            </div>
            {expandedSections.trends ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
          </button>

          {expandedSections.trends && (
            <div className='px-6 pb-6 space-y-4'>
              {/* Tendencia General */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center space-x-3 mb-3'>
                  {getTrendIcon(longTermTrends.overallTrend)}
                  <h4 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Tendencia General
                  </h4>
                </div>
                <p className={`text-sm font-bold ${getTrendColor(longTermTrends.overallTrend)}`}>
                  {longTermTrends.overallTrend === 'improving'
                    ? 'Mejorando'
                    : longTermTrends.overallTrend === 'declining'
                    ? 'Declinando'
                    : longTermTrends.overallTrend === 'cyclical'
                    ? 'Cíclico'
                    : 'Estable'}
                </p>
              </div>

              {/* Patrones Identificados */}
              {longTermTrends.seasonalPatterns && longTermTrends.seasonalPatterns.length > 0 && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`text-lg font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Patrones Estacionales
                  </h4>
                  <ul className='space-y-2'>
                    {longTermTrends.seasonalPatterns.map((pattern: string, index: number) => (
                      <li key={index} className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        • {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Predicciones */}
              {longTermTrends.predictions && longTermTrends.predictions.length > 0 && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`text-lg font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Predicciones (Próximos 30 días)
                  </h4>
                  <ul className='space-y-2'>
                    {longTermTrends.predictions.map((prediction: string, index: number) => (
                      <li key={index} className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        • {prediction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Patrones de Comportamiento */}
      {moodStatistics?.patterns && (
        <div
          className={`rounded-2xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-green-500'
              : 'bg-white border-gray-200 hover:border-green-500'
          }`}
        >
          <button
            onClick={() => toggleSection('patterns')}
            className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-300 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center space-x-3'>
              <PieChart className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                PATRONES DE COMPORTAMIENTO
              </h3>
            </div>
            {expandedSections.patterns ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
          </button>

          {expandedSections.patterns && (
            <div className='px-6 pb-6 space-y-4'>
              {/* Actividades Comunes */}
              {moodStatistics.patterns.commonActivities.length > 0 && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`text-lg font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Actividades Frecuentes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {moodStatistics.patterns.commonActivities.map((activity: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emociones Comunes */}
              {moodStatistics.patterns.commonEmotions.length > 0 && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`text-lg font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Emociones Frecuentes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {moodStatistics.patterns.commonEmotions.map((emotion: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isDarkMode ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tendencias de Energía y Estrés */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center space-x-2 mb-2'>
                    <Zap className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Energía</h4>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getTrendIcon(moodStatistics.patterns.energyTrend)}
                    <span className={`text-sm font-bold ${getTrendColor(moodStatistics.patterns.energyTrend)}`}>
                      {moodStatistics.patterns.energyTrend === 'improving'
                        ? 'Mejorando'
                        : moodStatistics.patterns.energyTrend === 'declining'
                        ? 'Declinando'
                        : 'Estable'}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-center space-x-2 mb-2'>
                    <Shield className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estrés</h4>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getTrendIcon(moodStatistics.patterns.stressTrend)}
                    <span className={`text-sm font-bold ${getTrendColor(moodStatistics.patterns.stressTrend)}`}>
                      {moodStatistics.patterns.stressTrend === 'improving'
                        ? 'Mejorando'
                        : moodStatistics.patterns.stressTrend === 'declining'
                        ? 'Declinando'
                        : 'Estable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recomendaciones */}
      {longTermTrends?.recommendations && longTermTrends.recommendations.length > 0 && (
        <div
          className={`rounded-2xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-orange-500'
              : 'bg-white border-gray-200 hover:border-orange-500'
          }`}
        >
          <button
            onClick={() => toggleSection('recommendations')}
            className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-300 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center space-x-3'>
              <Target className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                RECOMENDACIONES PERSONALIZADAS
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
                }`}
              >
                {longTermTrends.recommendations.length}
              </span>
            </div>
            {expandedSections.recommendations ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
          </button>

          {expandedSections.recommendations && (
            <div className='px-6 pb-6 space-y-4'>
              {longTermTrends.recommendations.map((recommendation: string, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 hover:border-orange-400'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-400'
                  }`}
                >
                  <div className='flex items-start space-x-3'>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-orange-600' : 'bg-orange-100'
                      }`}
                    >
                      <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-orange-800'}`}>
                        {index + 1}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                    >
                      {recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAIInsights;
