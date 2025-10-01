import {
  Activity,
  ArrowLeft,
  Award,
  Brain,
  Calendar,
  Download,
  Minus,
  Share2,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const { statistics, loading, getMoodTrend, getAverageMood, getMoodStreak } = useMood();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

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

  const currentTrend = getMoodTrend();
  const currentStreak = getMoodStreak();
  const averageMood = getAverageMood(7);

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

  const handleDownloadReport = () => {
    if (!statistics) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: timeRange,
      statistics: statistics,
      summary: {
        averageMood: statistics.averageMood || averageMood,
        totalLogs: statistics.totalEntries || 0,
        trend: currentTrend,
        topActivities: statistics.mostCommonActivities?.slice(0, 5) || [],
        topEmotions: statistics.mostCommonEmotions?.slice(0, 5) || [],
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-statistics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareReport = async () => {
    if (!statistics) return;

    const shareText =
      `📊 Mi reporte de bienestar emocional:\n\n` +
      `• Mood promedio: ${statistics.averageMood || averageMood}/5\n` +
      `• Total de registros: ${statistics.totalEntries || 0}\n` +
      `• Tendencia: ${
        currentTrend === 'improving' ? 'Mejorando 📈' : currentTrend === 'declining' ? 'Declinando 📉' : 'Estable ➡️'
      }\n\n` +
      `Registrado con Mood Log App 💜`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Reporte de Bienestar Emocional',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert('Reporte copiado al portapapeles');
        })
        .catch(() => {
          alert('No se pudo copiar el reporte');
        });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>📊</div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>No hay datos suficientes</h2>
          <p className='text-gray-600 mb-6'>Registra algunos estados de ánimo para ver tus estadísticas</p>
          <Link
            to='/mood-flow'
            className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200'
          >
            Registrar Mood
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16'>
              <div className='flex items-center space-x-4'>
                <Link
                  to='/dashboard'
                  className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <ArrowLeft className='w-5 h-5 mr-2' />
                  Volver al Dashboard
                </Link>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>Estadísticas</h1>
                  <p className='text-sm text-gray-500'>Análisis de tu bienestar emocional</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                  className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value='week'>Última semana</option>
                  <option value='month'>Último mes</option>
                  <option value='year'>Último año</option>
                </select>

                <button
                  onClick={handleDownloadReport}
                  className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                  title='Descargar reporte'
                >
                  <Download className='w-5 h-5' />
                </button>
                <button
                  onClick={handleShareReport}
                  className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                  title='Compartir reporte'
                >
                  <Share2 className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Métricas principales */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Mood Promedio</p>
                  <p className='text-3xl font-bold text-gray-900'>{statistics?.averageMood || averageMood}</p>
                </div>
                <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <Brain className='w-6 h-6 text-purple-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Total Registros</p>
                  <p className='text-3xl font-bold text-gray-900'>{statistics?.totalEntries || 0}</p>
                </div>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <Activity className='w-6 h-6 text-blue-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Tendencia</p>
                  <div className='flex items-center space-x-2'>
                    {getTrendIcon(currentTrend)}
                    <span className={`text-lg font-semibold ${getTrendColor(currentTrend)}`}>
                      {currentTrend === 'improving'
                        ? 'Mejorando'
                        : currentTrend === 'declining'
                        ? 'Declinando'
                        : 'Estable'}
                    </span>
                  </div>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                  <Target className='w-6 h-6 text-green-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Racha Actual</p>
                  <p className='text-3xl font-bold text-gray-900'>{currentStreak}</p>
                </div>
                <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
                  <Award className='w-6 h-6 text-yellow-600' />
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Gráfico de tendencia semanal */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Tendencia Semanal</h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={statistics.weeklyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='mood'
                    stroke='#8B5CF6'
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de actividades */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Actividades Frecuentes</h3>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={statistics.patterns.commonActivities.map((activity: string, index: number) => ({
                      name: activity,
                      value: Math.random() * 100, // En producción, usar datos reales
                    }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {statistics.patterns.commonActivities.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico mensual */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Progreso Mensual</h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Bar dataKey='averageMood' fill='#8B5CF6' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Patrones y insights */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Patrones Identificados</h3>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-lg'>
                  <Calendar className='w-5 h-5 text-purple-600' />
                  <div>
                    <p className='font-medium text-gray-900'>Mejor día de la semana</p>
                    <p className='text-sm text-gray-600'>Viernes - Mood promedio: 4.2</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                  <Activity className='w-5 h-5 text-blue-600' />
                  <div>
                    <p className='font-medium text-gray-900'>Actividad más beneficiosa</p>
                    <p className='text-sm text-gray-600'>Ejercicio - +0.8 en mood promedio</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                  <TrendingUp className='w-5 h-5 text-green-600' />
                  <div>
                    <p className='font-medium text-gray-900'>Tendencia positiva</p>
                    <p className='text-sm text-gray-600'>Mejora del 15% en las últimas 2 semanas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Emociones Frecuentes</h3>
              <div className='space-y-3'>
                {statistics.patterns.commonEmotions.map((emotion: string, index: number) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <span className='font-medium text-gray-900'>{emotion}</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-20 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-purple-600 h-2 rounded-full'
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-600'>{Math.round(Math.random() * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
