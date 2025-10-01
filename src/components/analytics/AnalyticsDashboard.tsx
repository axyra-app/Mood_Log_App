import { Activity, BarChart3, Calendar, Download, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AnalyticsData, analyticsService } from '../../services/analyticsService';
import StatsCard from '../ui/StatsCard';

interface AnalyticsDashboardProps {
  userId: string;
  isDarkMode: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId, isDarkMode }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [userId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getRealTimeAnalytics(userId);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const report = await analyticsService.generateMoodTrendsReport(userId, startDate, endDate);

      // Aquí podrías implementar la descarga del reporte
      console.log('Report generated:', report);
      alert('Reporte generado exitosamente');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Error al generar reporte');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='w-4 h-4 text-green-600' />;
      case 'down':
        return <TrendingDown className='w-4 h-4 text-red-600' />;
      default:
        return <Activity className='w-4 h-4 text-gray-600' />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded mb-4'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='h-32 bg-gray-300 rounded'></div>
            <div className='h-32 bg-gray-300 rounded'></div>
            <div className='h-32 bg-gray-300 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='text-center py-8'>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={loadAnalytics}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='text-center py-8'>
          <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-600'>No hay datos suficientes para mostrar analytics</p>
        </div>
      </div>
    );
  }

  const mainTrend = analytics.moodTrends[0];

  return (
    <div
      className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Analytics y Reportes</h3>

        <div className='flex items-center space-x-3'>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <option value='7d'>Últimos 7 días</option>
            <option value='30d'>Últimos 30 días</option>
            <option value='90d'>Últimos 90 días</option>
          </select>

          <button
            onClick={generateReport}
            className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors'
          >
            <Download className='w-4 h-4' />
            <span>Generar Reporte</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <StatsCard
          title='Estado de Ánimo Promedio'
          value={`${mainTrend.average.toFixed(1)}/5`}
          icon={BarChart3}
          iconColor='text-blue-600'
          iconBg='bg-blue-100'
          trend={{
            value: Math.round(mainTrend.change * 100),
            isPositive: mainTrend.trend === 'up',
          }}
          isDarkMode={isDarkMode}
        />

        <StatsCard
          title='Registros Totales'
          value={mainTrend.dataPoints}
          icon={Calendar}
          iconColor='text-green-600'
          iconBg='bg-green-100'
          isDarkMode={isDarkMode}
        />

        <StatsCard
          title='Tendencia'
          value={mainTrend.trend === 'up' ? 'Mejorando' : mainTrend.trend === 'down' ? 'Declinando' : 'Estable'}
          icon={Activity}
          iconColor={
            mainTrend.trend === 'up' ? 'text-green-600' : mainTrend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }
          iconBg={mainTrend.trend === 'up' ? 'bg-green-100' : mainTrend.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Patrones de Actividad */}
      {analytics.activityPatterns.length > 0 && (
        <div className='mb-6'>
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Patrones de Actividad
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {analytics.activityPatterns.slice(0, 6).map((pattern, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pattern.activity}</h5>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      pattern.impact === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : pattern.impact === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pattern.impact === 'positive'
                      ? 'Positivo'
                      : pattern.impact === 'negative'
                      ? 'Negativo'
                      : 'Neutral'}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Frecuencia: {pattern.frequency} veces
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Correlación: {pattern.correlation > 0 ? '+' : ''}
                  {pattern.correlation.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patrones Emocionales */}
      {analytics.emotionalPatterns.length > 0 && (
        <div className='mb-6'>
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💭 Patrones Emocionales
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {analytics.emotionalPatterns.slice(0, 6).map((pattern, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pattern.emotion}</h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Frecuencia: {pattern.frequency} veces
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Intensidad: {pattern.intensity.toFixed(1)}/5
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de Bienestar */}
      <div className='mb-6'>
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🌟 Métricas de Bienestar
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>😴 Sueño</h5>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.wellnessMetrics.sleep.average.toFixed(1)}/5
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Calidad: {analytics.wellnessMetrics.sleep.quality}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚡ Energía</h5>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.wellnessMetrics.energy.average.toFixed(1)}/5
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tendencia: {analytics.wellnessMetrics.energy.trend}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>😰 Estrés</h5>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.wellnessMetrics.stress.average.toFixed(1)}/5
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tendencia: {analytics.wellnessMetrics.stress.trend}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Tendencias */}
      <div
        className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
      >
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📈 Resumen de Tendencias
        </h4>
        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            {getTrendIcon(mainTrend.trend)}
            <span className={`text-sm ${getTrendColor(mainTrend.trend)}`}>
              Tu estado de ánimo está{' '}
              {mainTrend.trend === 'up' ? 'mejorando' : mainTrend.trend === 'down' ? 'declinando' : 'estable'}
            </span>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Promedio: {mainTrend.average.toFixed(1)}/5 ({mainTrend.dataPoints} registros)
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Cambio: {mainTrend.change > 0 ? '+' : ''}
            {mainTrend.change.toFixed(2)} puntos
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
