import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Download,
  Heart,
  Info,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useMood } from '../hooks/useMood';
import { moodAnalyzerAgent } from '../services/specializedAgents';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const { statistics, loading, getMoodTrend, getAverageMood, getMoodStreak } = useMood();
  const { entries: journalEntries, getJournalStats } = useJournal(user?.uid || '');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Formato colombiano para fechas y horas
  const formatDateColombian = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeColombian = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Obtener datos del período seleccionado
  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        // Lunes de esta semana
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        startDate = monday;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate: now };
  };

  // Generar análisis con IA profesional
  const generateAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { startDate, endDate } = getPeriodData();

      // Obtener datos de estado de ánimo del período
      const moodData = {
        moodLogs:
          statistics?.moodLogs?.filter((log) => {
            const logDate = new Date(log.createdAt);
            return logDate >= startDate && logDate <= endDate;
          }) || [],
        averageMood: getAverageMood(timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365),
        moodTrend: getMoodTrend(),
        streak: getMoodStreak(),
        journalEntries: journalEntries
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
          })
          .map((entry) => entry.content),
      };

      const analysis = await moodAnalyzerAgent.analyzeMood(moodData);
      setAiAnalysis(analysis);

      toast.success('Análisis de IA generado exitosamente');
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast.error('Error al generar análisis de IA');
    } finally {
      setAnalyzing(false);
    }
  };

  // Estadísticas del período
  const periodStats = {
    totalMoodLogs:
      statistics?.moodLogs?.filter((log) => {
        const logDate = new Date(log.createdAt);
        const { startDate, endDate } = getPeriodData();
        return logDate >= startDate && logDate <= endDate;
      }).length || 0,
    averageMood: getAverageMood(timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365),
    streak: getMoodStreak(),
    trend: getMoodTrend(),
    journalEntries: journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const { startDate, endDate } = getPeriodData();
      return entryDate >= startDate && entryDate <= endDate;
    }).length,
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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMoodLevel = (mood: number) => {
    if (mood >= 8) return { level: 'Excelente', color: 'text-green-600', icon: '😊' };
    if (mood >= 6) return { level: 'Bueno', color: 'text-blue-600', icon: '😌' };
    if (mood >= 4) return { level: 'Regular', color: 'text-yellow-600', icon: '😐' };
    if (mood >= 2) return { level: 'Bajo', color: 'text-orange-600', icon: '😔' };
    return { level: 'Muy Bajo', color: 'text-red-600', icon: '😢' };
  };

  const moodLevel = getMoodLevel(periodStats.averageMood);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-6'>
            <div className='flex items-center space-x-4'>
              <Link to='/dashboard' className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
                <ArrowLeft className='w-5 h-5 mr-2' />
                <span>Volver al Dashboard</span>
              </Link>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex bg-gray-100 rounded-lg p-1'>
                {(['week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
                  </button>
                ))}
              </div>

              <button className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'>
                <Download className='w-4 h-4' />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Período Actual */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Estadísticas de Bienestar</h1>
          <p className='text-gray-600'>
            Período: {formatDateColombian(getPeriodData().startDate)} - {formatDateColombian(getPeriodData().endDate)}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Estado de Ánimo Promedio</p>
                <p className='text-3xl font-bold text-gray-900'>{periodStats.averageMood.toFixed(1)}</p>
                <p className={`text-sm font-medium ${moodLevel.color}`}>
                  {moodLevel.icon} {moodLevel.level}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Heart className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Registros de Ánimo</p>
                <p className='text-3xl font-bold text-gray-900'>{periodStats.totalMoodLogs}</p>
                <p className='text-sm text-gray-500'>En este período</p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Activity className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Racha Actual</p>
                <p className='text-3xl font-bold text-gray-900'>{periodStats.streak}</p>
                <p className='text-sm text-gray-500'>Días consecutivos</p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <Award className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Tendencia</p>
                <div className='flex items-center space-x-2'>
                  {getTrendIcon(periodStats.trend)}
                  <span className={`text-lg font-semibold ${getTrendColor(periodStats.trend).split(' ')[0]}`}>
                    {getTrendText(periodStats.trend)}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Target className='w-6 h-6 text-orange-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de IA */}
        <div className='bg-white rounded-xl shadow-sm border p-6 mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-3'>
              <Logo size='sm' showText={false} />
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Análisis Profesional con IA</h3>
                <p className='text-sm text-gray-600'>Insights psicológicos basados en tus datos</p>
              </div>
            </div>

            <button
              onClick={generateAIAnalysis}
              disabled={analyzing}
              className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50'
            >
              <Logo className='w-4 h-4' />
              <span>{analyzing ? 'Analizando...' : 'Generar Análisis'}</span>
            </button>
          </div>

          {analyzing ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>Analizando tus datos con IA profesional...</p>
            </div>
          ) : aiAnalysis ? (
            <div className='space-y-6'>
              {/* Resumen Principal */}
              {aiAnalysis.summary && (
                <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200'>
                  <h4 className='font-semibold text-purple-800 mb-2 flex items-center'>
                    <Info className='w-4 h-4 mr-2' />
                    Resumen Ejecutivo
                  </h4>
                  <p className='text-gray-700'>{aiAnalysis.summary}</p>
                </div>
              )}

              {/* Patrones Identificados */}
              {aiAnalysis.patterns && aiAnalysis.patterns.length > 0 && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3 flex items-center'>
                    <TrendingUp className='w-5 h-5 mr-2 text-blue-500' />
                    Patrones Identificados
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {aiAnalysis.patterns.map((pattern: string, index: number) => (
                      <div key={index} className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
                        <p className='text-sm text-blue-800'>{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights Clave */}
              {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3 flex items-center'>
                    <CheckCircle className='w-5 h-5 mr-2 text-green-500' />
                    Insights Clave
                  </h4>
                  <div className='space-y-2'>
                    {aiAnalysis.insights.map((insight: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-start space-x-3 bg-green-50 rounded-lg p-3 border border-green-200'
                      >
                        <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                        <p className='text-sm text-green-800'>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-3 flex items-center'>
                    <Target className='w-5 h-5 mr-2 text-purple-500' />
                    Recomendaciones Profesionales
                  </h4>
                  <div className='space-y-2'>
                    {aiAnalysis.recommendations.map((rec: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-start space-x-3 bg-purple-50 rounded-lg p-3 border border-purple-200'
                      >
                        <Target className='w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0' />
                        <p className='text-sm text-purple-800'>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluación de Riesgo */}
              {aiAnalysis.riskLevel && (
                <div className='bg-gray-50 rounded-lg p-4 border'>
                  <h4 className='font-semibold text-gray-900 mb-2 flex items-center'>
                    <AlertTriangle className='w-5 h-5 mr-2 text-orange-500' />
                    Evaluación de Bienestar
                  </h4>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      aiAnalysis.riskLevel === 'high'
                        ? 'bg-red-100 text-red-800'
                        : aiAnalysis.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {aiAnalysis.riskLevel === 'high'
                      ? 'Requiere Atención'
                      : aiAnalysis.riskLevel === 'medium'
                      ? 'Seguimiento Recomendado'
                      : 'Estado Saludable'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <Logo size='lg' showText={false} className='mx-auto mb-4 text-gray-300' />
              <p className='font-medium'>Análisis Inteligente de tu Bienestar</p>
              <p className='text-sm'>Haz clic en "Generar Análisis" para obtener insights personalizados</p>
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Clock className='w-5 h-5 mr-2 text-gray-600' />
            Actividad Reciente
          </h3>

          {statistics?.moodLogs && statistics.moodLogs.length > 0 ? (
            <div className='space-y-3'>
              {statistics.moodLogs.slice(0, 5).map((log, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-purple-600'>{log.mood}</span>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>Estado de ánimo registrado</p>
                      <p className='text-xs text-gray-500'>
                        {formatDateColombian(new Date(log.createdAt))} a las{' '}
                        {formatTimeColombian(new Date(log.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-gray-500'>{getMoodLevel(log.mood).icon}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <Activity className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <p>No hay actividad reciente</p>
              <p className='text-sm'>Comienza registrando tu estado de ánimo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
