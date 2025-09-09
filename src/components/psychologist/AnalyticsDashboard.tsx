import { Activity, BarChart3, PieChart, Target, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  analyzeEmotionalPatterns,
  calculateMoodTrend,
  generateWellnessInsights,
  getMoodStatistics,
} from '../../services/analyticsService';
import { EmotionalPattern, MoodTrend, Patient, WellnessInsights } from '../../types';

interface AnalyticsDashboardProps {
  patients: Patient[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ patients }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [moodTrend, setMoodTrend] = useState<MoodTrend | null>(null);
  const [emotionalPatterns, setEmotionalPatterns] = useState<EmotionalPattern[]>([]);
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
  const [moodStats, setMoodStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    if (selectedPatient) {
      loadAnalytics();
    }
  }, [selectedPatient, timeRange]);

  const loadAnalytics = async () => {
    if (!selectedPatient) return;

    try {
      setLoading(true);

      const [trend, patterns, insights, stats] = await Promise.all([
        calculateMoodTrend(selectedPatient.userId, timeRange),
        analyzeEmotionalPatterns(selectedPatient.userId),
        generateWellnessInsights(selectedPatient.userId),
        getMoodStatistics(selectedPatient.userId, 30),
      ]);

      setMoodTrend(trend);
      setEmotionalPatterns(patterns);
      setWellnessInsights(insights);
      setMoodStats(stats);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className='h-5 w-5 text-green-500' />;
      case 'declining':
        return <TrendingDown className='h-5 w-5 text-red-500' />;
      default:
        return <Activity className='h-5 w-5 text-gray-500' />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-100';
      case 'declining':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getWellnessScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Analytics Avanzados</h2>
        <div className='flex items-center space-x-4'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className='border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
          >
            <option value='daily'>Diario</option>
            <option value='weekly'>Semanal</option>
            <option value='monthly'>Mensual</option>
            <option value='yearly'>Anual</option>
          </select>
        </div>
      </div>

      {/* Patient Selection */}
      <div className='bg-white p-4 rounded-lg shadow'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Seleccionar Paciente para Analytics</label>
        <select
          value={selectedPatient?.id || ''}
          onChange={(e) => {
            const patient = patients.find((p) => p.id === e.target.value);
            setSelectedPatient(patient || null);
          }}
          className='block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
        >
          <option value=''>Selecciona un paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              Paciente {patient.id.slice(0, 8)} - {patient.status}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Cargando analytics...</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Overview Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='bg-white p-6 rounded-lg shadow'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <BarChart3 className='h-8 w-8 text-blue-500' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>Mood Promedio</p>
                      <p className='text-2xl font-bold text-gray-900'>{moodTrend?.averageMood?.toFixed(1) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>{moodTrend && getTrendIcon(moodTrend.trend)}</div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>Tendencia</p>
                      <p
                        className={`text-lg font-bold ${
                          moodTrend ? getTrendColor(moodTrend.trend).split(' ')[0] : 'text-gray-900'
                        }`}
                      >
                        {moodTrend?.trend === 'improving'
                          ? 'Mejorando'
                          : moodTrend?.trend === 'declining'
                          ? 'Declinando'
                          : 'Estable'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <PieChart className='h-8 w-8 text-green-500' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>Volatilidad</p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {moodTrend?.volatility ? (moodTrend.volatility * 100).toFixed(0) + '%' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Target className='h-8 w-8 text-purple-500' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>Puntuación Bienestar</p>
                      <p
                        className={`text-2xl font-bold ${
                          wellnessInsights ? getWellnessScoreColor(wellnessInsights.overallScore) : 'text-gray-900'
                        }`}
                      >
                        {wellnessInsights?.overallScore || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mood Trend Chart */}
              {moodTrend && (
                <div className='bg-white p-6 rounded-lg shadow'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>Tendencia de Mood</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Período: {timeRange}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendColor(
                          moodTrend.trend
                        )}`}
                      >
                        {moodTrend.trend === 'improving'
                          ? 'Mejorando'
                          : moodTrend.trend === 'declining'
                          ? 'Declinando'
                          : 'Estable'}
                      </span>
                    </div>

                    <div className='grid grid-cols-7 gap-2'>
                      {moodTrend.data.slice(-7).map((dataPoint, index) => (
                        <div key={index} className='text-center'>
                          <div className='text-2xl mb-1'>{getMoodEmoji(dataPoint.mood)}</div>
                          <div className='text-xs text-gray-500'>
                            {new Date(dataPoint.date).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className='text-xs font-medium text-gray-900'>{dataPoint.mood}/5</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Emotional Patterns */}
              {emotionalPatterns.length > 0 && (
                <div className='bg-white p-6 rounded-lg shadow'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>Patrones Emocionales</h3>
                  <div className='space-y-4'>
                    {emotionalPatterns.slice(0, 5).map((pattern, index) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-gray-900 capitalize'>{pattern.emotion}</h4>
                          <div className='flex items-center space-x-2'>
                            <span className='text-sm text-gray-500'>
                              Frecuencia: {(pattern.frequency * 100).toFixed(1)}%
                            </span>
                            <span className='text-sm text-gray-500'>Intensidad: {pattern.intensity.toFixed(1)}/5</span>
                          </div>
                        </div>

                        {pattern.triggers.length > 0 && (
                          <div className='mb-2'>
                            <p className='text-sm text-gray-600 mb-1'>Desencadenantes:</p>
                            <div className='flex flex-wrap gap-1'>
                              {pattern.triggers.slice(0, 3).map((trigger, triggerIndex) => (
                                <span
                                  key={triggerIndex}
                                  className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                                >
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='flex items-center space-x-4 text-xs text-gray-500'>
                          <span>Horarios: {pattern.timeOfDay.join(', ')}</span>
                          <span>Días: {pattern.dayOfWeek.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wellness Insights */}
              {wellnessInsights && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='bg-white p-6 rounded-lg shadow'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Fortalezas</h3>
                    <div className='space-y-2'>
                      {wellnessInsights.strengths.map((strength, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-sm text-gray-700'>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='bg-white p-6 rounded-lg shadow'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Áreas de Mejora</h3>
                    <div className='space-y-2'>
                      {wellnessInsights.areasForImprovement.map((area, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                          <span className='text-sm text-gray-700'>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='bg-white p-6 rounded-lg shadow'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Recomendaciones</h3>
                    <div className='space-y-2'>
                      {wellnessInsights.recommendations.slice(0, 5).map((recommendation, index) => (
                        <div key={index} className='flex items-start space-x-2'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                          <span className='text-sm text-gray-700'>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='bg-white p-6 rounded-lg shadow'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Objetivos</h3>
                    <div className='space-y-4'>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Corto Plazo</h4>
                        <div className='space-y-1'>
                          {wellnessInsights.goals.shortTerm.map((goal, index) => (
                            <div key={index} className='flex items-center space-x-2'>
                              <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                              <span className='text-sm text-gray-700'>{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Largo Plazo</h4>
                        <div className='space-y-1'>
                          {wellnessInsights.goals.longTerm.map((goal, index) => (
                            <div key={index} className='flex items-center space-x-2'>
                              <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                              <span className='text-sm text-gray-700'>{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Statistics */}
              {moodStats && (
                <div className='bg-white p-6 rounded-lg shadow'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>Estadísticas Detalladas</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-gray-900'>{moodStats.totalEntries}</p>
                      <p className='text-sm text-gray-500'>Registros Totales</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-gray-900'>{moodStats.averageMood}</p>
                      <p className='text-sm text-gray-500'>Mood Promedio</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-gray-900'>
                        {moodStats.mostCommonEmotions[0]?.emotion || 'N/A'}
                      </p>
                      <p className='text-sm text-gray-500'>Emoción Más Común</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-gray-900'>
                        {moodStats.mostCommonActivities[0]?.activity || 'N/A'}
                      </p>
                      <p className='text-sm text-gray-500'>Actividad Más Común</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
