import {
  Activity,
  BarChart3,
  Brain,
  Download,
  Heart,
  LineChart,
  Moon,
  PieChart,
  Sun,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { generateWellnessInsights, getMoodStatistics } from '../services/analyticsService';
import { WellnessInsights } from '../types';

interface AdvancedAnalyticsProps {
  userId: string;
  isDarkMode?: boolean;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ userId, isDarkMode = false }) => {
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [moodStats, setMoodStats] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'trends' | 'recommendations'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [userId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [insightsData, statsData] = await Promise.all([
        generateWellnessInsights(userId),
        getMoodStatistics(userId, selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365),
      ]);

      setInsights(insightsData);
      setMoodStats(statsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className='w-5 h-5 text-green-500' />;
      case 'declining':
        return <TrendingDown className='w-5 h-5 text-red-500' />;
      default:
        return <Activity className='w-5 h-5 text-blue-500' />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Mejorando';
      case 'declining':
        return 'Declinando';
      default:
        return 'Estable';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-32 bg-gray-300 dark:bg-gray-700 rounded'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-300 dark:bg-gray-700 rounded'></div>
        </div>
      </div>
    );
  }

  if (!insights || !moodStats) {
    return (
      <div className={`p-6 text-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <p>No hay datos suficientes para mostrar analíticas.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold mb-2'>Analíticas Avanzadas</h2>
          <p className='text-gray-500'>Insights detallados sobre tu bienestar emocional</p>
        </div>

        <div className='flex items-center space-x-4'>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
            className={`px-3 py-2 rounded border ${
              isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value='week'>Última semana</option>
            <option value='month'>Último mes</option>
            <option value='year'>Último año</option>
          </select>

          <button className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            <Download className='w-4 h-4' />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700'>
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'patterns', label: 'Patrones', icon: PieChart },
          { id: 'trends', label: 'Tendencias', icon: LineChart },
          { id: 'recommendations', label: 'Recomendaciones', icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className='w-4 h-4' />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Overall Score */}
          <div className={`p-6 rounded-lg ${getScoreBgColor(insights.overallScore)}`}>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>Puntuación General de Bienestar</h3>
                <div className={`text-4xl font-bold ${getScoreColor(insights.overallScore)}`}>
                  {insights.overallScore}/100
                </div>
                <p className='text-sm mt-2'>
                  {insights.overallScore >= 80
                    ? 'Excelente nivel de bienestar'
                    : insights.overallScore >= 60
                    ? 'Buen nivel de bienestar'
                    : 'Oportunidades de mejora'}
                </p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>{moodStats.averageMood.toFixed(1)}/5</div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>Estado de ánimo promedio</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className='flex items-center space-x-2 mb-2'>
                <Heart className='w-5 h-5 text-red-500' />
                <span className='font-semibold'>Registros</span>
              </div>
              <div className='text-2xl font-bold'>{moodStats.totalEntries}</div>
              <div className='text-sm text-gray-500'>Total de entradas</div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className='flex items-center space-x-2 mb-2'>
                <Activity className='w-5 h-5 text-blue-500' />
                <span className='font-semibold'>Tendencia</span>
              </div>
              <div className='flex items-center space-x-2'>
                {getTrendIcon(insights.trends[0]?.trend || 'stable')}
                <span className={`font-semibold ${getTrendColor(insights.trends[0]?.trend || 'stable')}`}>
                  {getTrendText(insights.trends[0]?.trend || 'stable')}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className='flex items-center space-x-2 mb-2'>
                <Sun className='w-5 h-5 text-yellow-500' />
                <span className='font-semibold'>Mejor día</span>
              </div>
              <div className='text-lg font-bold capitalize'>
                {moodStats.moodByDayOfWeek
                  ? Object.entries(moodStats.moodByDayOfWeek).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                  : 'N/A'}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className='flex items-center space-x-2 mb-2'>
                <Moon className='w-5 h-5 text-indigo-500' />
                <span className='font-semibold'>Mejor momento</span>
              </div>
              <div className='text-lg font-bold capitalize'>
                {moodStats.moodByTimeOfDay
                  ? Object.entries(moodStats.moodByTimeOfDay).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className='font-semibold mb-3 text-green-600 dark:text-green-400'>Fortalezas</h4>
              <ul className='space-y-2'>
                {insights.strengths.map((strength, index) => (
                  <li key={index} className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className='font-semibold mb-3 text-orange-600 dark:text-orange-400'>Áreas de Mejora</h4>
              <ul className='space-y-2'>
                {insights.areasForImprovement.map((area, index) => (
                  <li key={index} className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    <span className='text-sm'>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold mb-4'>Patrones Emocionales</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {insights.patterns.map((pattern, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-semibold capitalize'>{pattern.emotion}</h4>
                  <span className='text-sm text-gray-500'>{Math.round(pattern.frequency * 100)}%</span>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Frecuencia:</span>
                    <span>{Math.round(pattern.intensity * 10) / 10}/10</span>
                  </div>

                  {pattern.triggers.length > 0 && (
                    <div>
                      <div className='text-sm font-medium mb-1'>Desencadenantes:</div>
                      <div className='flex flex-wrap gap-1'>
                        {pattern.triggers.slice(0, 3).map((trigger, i) => (
                          <span
                            key={i}
                            className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded'
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pattern.timeOfDay.length > 0 && (
                    <div>
                      <div className='text-sm font-medium mb-1'>Horarios comunes:</div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>{pattern.timeOfDay.join(', ')}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Most Common Activities */}
          {moodStats.mostCommonActivities && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className='font-semibold mb-3'>Actividades Más Comunes</h4>
              <div className='space-y-2'>
                {moodStats.mostCommonActivities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className='flex justify-between items-center'>
                    <span className='capitalize'>{activity.activity}</span>
                    <span className='text-sm text-gray-500'>{activity.count} veces</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold mb-4'>Tendencias Temporales</h3>

          {insights.trends.map((trend, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-semibold capitalize'>
                  Tendencias{' '}
                  {trend.period === 'daily'
                    ? 'Diarias'
                    : trend.period === 'weekly'
                    ? 'Semanales'
                    : trend.period === 'monthly'
                    ? 'Mensuales'
                    : 'Anuales'}
                </h4>
                <div className='flex items-center space-x-2'>
                  {getTrendIcon(trend.trend)}
                  <span className={`font-semibold ${getTrendColor(trend.trend)}`}>{getTrendText(trend.trend)}</span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{trend.averageMood.toFixed(1)}/5</div>
                  <div className='text-sm text-gray-500'>Estado de ánimo promedio</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{Math.round(trend.volatility * 100)}%</div>
                  <div className='text-sm text-gray-500'>Variabilidad</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{trend.data.length}</div>
                  <div className='text-sm text-gray-500'>Puntos de datos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold mb-4'>Recomendaciones Personalizadas</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className='font-semibold mb-3 text-blue-600 dark:text-blue-400'>Recomendaciones Generales</h4>
              <ul className='space-y-2'>
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='text-sm'>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className='font-semibold mb-3 text-green-600 dark:text-green-400'>Objetivos a Corto Plazo</h4>
              <ul className='space-y-2'>
                {insights.goals.shortTerm.map((goal, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='text-sm'>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className='font-semibold mb-3 text-purple-600 dark:text-purple-400'>Objetivos a Largo Plazo</h4>
            <ul className='space-y-2'>
              {insights.goals.longTerm.map((goal, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-sm'>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk and Protective Factors */}
          {(insights.riskFactors.length > 0 || insights.protectiveFactors.length > 0) && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {insights.riskFactors.length > 0 && (
                <div
                  className={`p-4 rounded-lg border-l-4 border-red-500 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}
                >
                  <h4 className='font-semibold mb-3 text-red-600 dark:text-red-400'>Factores de Riesgo</h4>
                  <ul className='space-y-2'>
                    {insights.riskFactors.map((factor, index) => (
                      <li key={index} className='flex items-start space-x-2'>
                        <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-sm'>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.protectiveFactors.length > 0 && (
                <div
                  className={`p-4 rounded-lg border-l-4 border-green-500 ${
                    isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                  }`}
                >
                  <h4 className='font-semibold mb-3 text-green-600 dark:text-green-400'>Factores Protectores</h4>
                  <ul className='space-y-2'>
                    {insights.protectiveFactors.map((factor, index) => (
                      <li key={index} className='flex items-start space-x-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-sm'>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
