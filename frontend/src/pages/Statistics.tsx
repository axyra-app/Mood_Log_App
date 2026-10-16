import {
  Activity,
  AlertTriangle,
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
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useMood } from '../hooks/useMood';
import { MoodAnalysisResult, moodAnalyzerAgent } from '../services/specializedAgents';
import { getMoodLogsByDateRange } from '../services/moodLogService';
import { MoodLog } from '../types';
import { prepareMoodAnalysis } from '../utils/moodAnalysisPayload';
import { toDate } from '../utils/moodMetrics';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const { moodLogs, loading, error, getMoodTrend, getMoodStreak } = useMood();
  const { entries: journalEntries } = useJournal(user?.uid || '');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [periodLogs, setPeriodLogs] = useState<MoodLog[]>([]);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<MoodAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiDataConsent, setAiDataConsent] = useState(false);

  useEffect(() => {
    setAiAnalysis(null);
    setAnalysisError(null);
    setAiDataConsent(false);
  }, [timeRange]);

  // Función para exportar estadísticas como PDF
  const exportStatistics = async () => {
    try {
      const periodMoodLogs = getLogsInPeriod();
      const doc = new jsPDF();

      // Configuración del documento
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Función para agregar texto con wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
      };

      // Logo y título
      doc.setFillColor(147, 51, 234); // Purple
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Mood Log App', 20, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Reporte de Estadísticas de Bienestar', 20, 25);

      yPosition = 40;

      // Información del período
      addText(`Período: ${timeRange === 'week' ? 'Semana' : timeRange === 'month' ? 'Mes' : 'Año'}`, 16, true, '#374151');
      addText(`${formatDateColombian(getPeriodData().startDate)} - ${formatDateColombian(getPeriodData().endDate)}`, 12, false, '#6B7280');
      yPosition += 10;

      // Estadísticas principales
      addText('Resumen Ejecutivo', 16, true, '#374151');
      yPosition += 5;

      const statsData = [
        { label: 'Estado de Ánimo Promedio', value: `${periodStats.averageMood.toFixed(1)}/10 (${moodLevel.level})` },
        { label: 'Registros de Ánimo', value: `${periodStats.totalMoodLogs} registros` },
        { label: 'Racha Actual', value: `${periodStats.streak} días consecutivos` },
        { label: 'Tendencia', value: getTrendText(periodStats.trend) },
        { label: 'Entradas de Diario', value: `${periodStats.journalEntries} entradas` }
      ];

      statsData.forEach(stat => {
        addText(`${stat.label}: ${stat.value}`, 12, false, '#374151');
      });

      yPosition += 10;

      // Análisis de IA si está disponible
      if (aiAnalysis) {
        addText('Reflexión sobre tu bienestar con IA', 16, true, '#374151');
        yPosition += 5;

        if (aiAnalysis.summary) {
          addText('Resumen:', 14, true, '#374151');
          addText(aiAnalysis.summary, 12, false, '#6B7280');
          yPosition += 5;
        }

        if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
          addText('Ideas para la autorreflexión:', 14, true, '#374151');
          aiAnalysis.recommendations.forEach((rec: unknown) => {
          addText(`• ${typeof rec === 'string' ? rec : JSON.stringify(rec)}`, 12, false, '#6B7280');
          });
          yPosition += 5;
        }
      }

      // Actividad reciente
      if (periodMoodLogs.length > 0) {
        addText('Actividad Reciente', 16, true, '#374151');
        yPosition += 5;

        const recentLogs = periodMoodLogs.slice(0, 10);
        recentLogs.forEach((log: any) => {
          const date = toDate(log.createdAt)?.toLocaleDateString('es-CO') || 'Fecha inválida';
          const moodLevel = getMoodLevel(log.mood);
          addText(`${date}: ${moodLevel.level} (${log.mood}/10)`, 12, false, '#6B7280');
        });
      }

      // Pie de página
      yPosition = pageHeight - 20;
      doc.setFontSize(10);
      doc.setTextColor('#6B7280');
      doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')} por Mood Log App`, 20, yPosition);

      // Guardar el PDF
      const fileName = `estadisticas-mood-log-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el reporte PDF');
    }
  };

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
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
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

  useEffect(() => {
    if (!user?.uid) {
      setPeriodLogs([]);
      setPeriodLoading(false);
      return;
    }

    let isCurrent = true;
    const { startDate, endDate } = getPeriodData();
    setPeriodLoading(true);
    setPeriodError(null);

    getMoodLogsByDateRange(user.uid, startDate, endDate)
      .then((logs) => {
        if (isCurrent) setPeriodLogs(logs);
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        setPeriodError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los registros del período.');
      })
      .finally(() => {
        if (isCurrent) setPeriodLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [timeRange, user?.uid]);

  const generateAIAnalysis = async () => {
    if (!aiDataConsent) {
      toast.error('Confirma el envío de estos datos antes de solicitar el análisis.');
      return;
    }

    if (periodLogs.length === 0) {
      toast.error('No hay registros de ánimo en este período para analizar.');
      return;
    }

    setAnalysisError(null);
    setAnalyzing(true);
    try {
      const preparedAnalysis = prepareMoodAnalysis(periodLogs, timeRange);
      const analysis = await moodAnalyzerAgent.analyzeMood(preparedAnalysis.moodData);
      setAiAnalysis(analysis);
      const countMessage = preparedAnalysis.includedCount < preparedAnalysis.totalCount
        ? ` (${preparedAnalysis.includedCount} de ${preparedAnalysis.totalCount} registros más recientes)`
        : '';
      toast.success(`Análisis generado${countMessage}.`);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      const message = error instanceof Error ? error.message : 'No se pudo generar el análisis.';
      setAnalysisError(message);
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getLogsInPeriod = () => periodLogs;

  // Estadísticas del período
  const periodStats = {
    totalMoodLogs: periodLogs.length,
    averageMood: periodLogs.length
      ? periodLogs.reduce((sum, log) => sum + log.mood, 0) / periodLogs.length
      : 0,
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

  if (loading || periodLoading) {
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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Header 
        title="Estadísticas de Bienestar"
        subtitle="Análisis de tu progreso emocional"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
        actions={
          <div className='flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3'>
            <div className='grid w-full grid-cols-3 rounded-lg bg-gray-100 p-1 dark:bg-gray-700 sm:w-auto'>
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`min-h-10 rounded-md px-2 text-xs font-medium transition-colors sm:min-h-9 sm:px-3 sm:text-sm ${
                    timeRange === range 
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>

            <button 
              onClick={exportStatistics}
              className='flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 text-sm text-white transition-colors hover:bg-purple-700 sm:min-h-10 sm:w-auto sm:text-base'
            >
              <Download className='w-4 h-4' />
              <span>Exportar</span>
            </button>
          </div>
        }
      />

      <main className='mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8'>
        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'>
            No se pudieron cargar todos tus registros: {error}
          </div>
        )}
        {periodError && (
          <div role='alert' className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'>
            No se pudieron cargar los registros de este período: {periodError}
          </div>
        )}

        {/* Información del Período */}
        <div className='mb-6'>
          <p className='break-words text-sm text-gray-600 dark:text-gray-400'>
            Período: {formatDateColombian(getPeriodData().startDate)} - {formatDateColombian(getPeriodData().endDate)}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className='mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mb-8 lg:grid-cols-4'>
          <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Estado de Ánimo Promedio</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>{periodStats.averageMood.toFixed(1)}</p>
                <p className={`text-sm font-medium ${periodStats.totalMoodLogs ? moodLevel.color : 'text-gray-500'}`}>
                  {periodStats.totalMoodLogs ? `${moodLevel.icon} ${moodLevel.level}` : 'Sin registros'}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center'>
                <Heart className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Registros de Ánimo</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>{periodStats.totalMoodLogs}</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>En este período</p>
              </div>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                <Activity className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Racha Actual</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>{periodStats.streak}</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Días consecutivos</p>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center'>
                <Award className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Tendencia</p>
                <div className='flex items-center space-x-2'>
                  {getTrendIcon(periodStats.trend)}
                  <span className={`text-lg font-semibold ${getTrendColor(periodStats.trend).split(' ')[0]}`}>
                    {getTrendText(periodStats.trend)}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center'>
                <Target className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de IA */}
        <section className='mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6' aria-labelledby='analysis-heading'>
          <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500'>
                <span className='text-lg text-white' aria-hidden='true'>🧠</span>
              </div>
              <div className='min-w-0'>
                <h2 id='analysis-heading' className='text-base font-semibold text-gray-900 dark:text-white sm:text-lg'>Reflexión sobre tu bienestar con IA</h2>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Observaciones para reflexionar, no una evaluación clínica</p>
              </div>
            </div>

            <button
              onClick={generateAIAnalysis}
              disabled={analyzing || !aiDataConsent || periodLogs.length === 0 || Boolean(periodError)}
              className='flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
            >
              {analyzing ? (
                <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' aria-hidden='true' />
              ) : (
                <span aria-hidden='true'>✨</span>
              )}
              <span>{analyzing ? 'Preparando reflexión…' : aiAnalysis ? 'Generar de nuevo' : 'Generar análisis'}</span>
            </button>
          </div>

          <label className='mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-5 text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
            <input
              type='checkbox'
              checked={aiDataConsent}
              onChange={(event) => setAiDataConsent(event.target.checked)}
              className='mt-0.5 h-5 w-5 shrink-0 accent-purple-600'
            />
            <span>Entiendo que se enviarán a Groq mis registros de ánimo, energía, estrés, sueño, notas, emociones y actividades de este período. El análisis usará como máximo 60 registros recientes.</span>
          </label>

          {analysisError && (
            <div role='alert' className='mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
              <p>{analysisError}</p>
            </div>
          )}

          {analyzing ? (
            <div className='rounded-lg bg-purple-50/70 px-4 py-10 text-center dark:bg-purple-950/20' role='status' aria-live='polite'>
              <div className='mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-300' />
              <p className='font-medium text-gray-800 dark:text-gray-100'>Preparando tu reflexión</p>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>Estamos organizando los registros del período de forma segura.</p>
            </div>
          ) : aiAnalysis ? (
            <div className='space-y-5 sm:space-y-6'>
              {/* Resumen Principal */}
              {aiAnalysis.summary && (
                <div className='rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-900 dark:from-purple-950/50 dark:to-pink-950/30 sm:p-5'>
                  <h3 className='mb-2 flex items-center font-semibold text-purple-900 dark:text-purple-200'>
                    <Info className='w-4 h-4 mr-2' />
                    Resumen de los registros
                  </h3>
                  <p className='leading-relaxed text-gray-700 dark:text-gray-200'>{aiAnalysis.summary}</p>
                </div>
              )}

              {/* Patrones Identificados */}
              {aiAnalysis.patterns.length > 0 && (
                <div>
                  <h3 className='mb-3 flex items-center font-semibold text-gray-900 dark:text-white'>
                    <TrendingUp className='w-5 h-5 mr-2 text-blue-500' />
                    Patrones observados
                  </h3>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {aiAnalysis.patterns.map((pattern, index) => (
                      <div key={`${index}-${pattern}`} className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30'>
                        <p className='text-sm leading-relaxed text-blue-900 dark:text-blue-200'>{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights Clave */}
              {aiAnalysis.insights.length > 0 && (
                <div>
                  <h3 className='mb-3 flex items-center font-semibold text-gray-900 dark:text-white'>
                    <CheckCircle className='w-5 h-5 mr-2 text-green-500' />
                    Observaciones clave
                  </h3>
                  <div className='space-y-2'>
                    {aiAnalysis.insights.map((insight, index) => (
                      <div
                        key={`${index}-${insight}`}
                        className='flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30'
                      >
                        <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                        <p className='text-sm leading-relaxed text-green-900 dark:text-green-200'>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {aiAnalysis.recommendations.length > 0 && (
                <div>
                  <h3 className='mb-3 flex items-center font-semibold text-gray-900 dark:text-white'>
                    <Target className='w-5 h-5 mr-2 text-purple-500' />
                    Ideas para la autorreflexión
                  </h3>
                  <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                    {aiAnalysis.recommendations.map((recommendation, index) => (
                      <div
                        key={`${index}-${recommendation}`}
                        className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30'
                      >
                        <div className='flex items-start gap-3'>
                          <Target className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-300' />
                          <p className='text-sm leading-relaxed text-purple-900 dark:text-purple-200'>{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiAnalysis.keyFactors.length > 0 && (
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900 dark:text-white'>Factores que aparecen en tus registros</h3>
                  <div className='flex flex-wrap gap-2'>
                    {aiAnalysis.keyFactors.map((factor, index) => (
                      <span key={`${index}-${factor}`} className='rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200'>
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiAnalysis.nextSteps.length > 0 && (
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900 dark:text-white'>Pequeños pasos para considerar</h3>
                  <ol className='space-y-2'>
                    {aiAnalysis.nextSteps.map((step, index) => (
                      <li key={`${index}-${step}`} className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50'>
                        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-200'>{index + 1}</span>
                        <span className='text-sm leading-relaxed text-gray-700 dark:text-gray-200'>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {aiAnalysis.interventionStrategies.length > 0 && (
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900 dark:text-white'>Estrategias cotidianas mencionadas</h3>
                  <ul className='space-y-2'>
                    {aiAnalysis.interventionStrategies.map((strategy, index) => (
                      <li key={`${index}-${strategy}`} className='flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200'>
                        <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500' />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.wellnessPlan.length > 0 && (
                <div className='rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/30'>
                  <h3 className='mb-2 font-semibold text-teal-900 dark:text-teal-200'>Ideas de autocuidado</h3>
                  <ul className='space-y-2'>
                    {aiAnalysis.wellnessPlan.map((idea, index) => (
                      <li key={`${index}-${idea}`} className='text-sm leading-relaxed text-teal-900 dark:text-teal-200'>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clasificación no clínica */}
              {aiAnalysis.riskLevel && (
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
                  <h3 className='mb-2 flex items-center font-semibold text-gray-900 dark:text-white'>
                    <AlertTriangle className='w-5 h-5 mr-2 text-orange-500' />
                    Clasificación informativa generada por IA
                  </h3>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      aiAnalysis.riskLevel === 'high'
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200'
                        : aiAnalysis.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {aiAnalysis.riskLevel === 'high'
                      ? 'Nivel indicado: alto'
                      : aiAnalysis.riskLevel === 'medium'
                      ? 'Nivel indicado: medio'
                      : 'Nivel indicado: bajo'}
                  </div>
                  <p className='mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400'>Esta clasificación puede equivocarse. No es un diagnóstico ni una evaluación clínica.</p>
                </div>
              )}
            </div>
          ) : (
            <div className='rounded-lg bg-gray-50 px-4 py-9 text-center text-gray-600 dark:bg-gray-900/50 dark:text-gray-300 sm:py-10'>
              <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-2xl dark:from-purple-900/60 dark:to-pink-900/50' aria-hidden='true'>
                🧠
              </div>
              <p className='font-medium text-gray-900 dark:text-white'>
                {periodLogs.length ? 'Tu reflexión aparecerá aquí' : 'Aún no hay registros en este período'}
              </p>
              <p className='mt-1 text-sm'>
                {periodLogs.length
                  ? 'Confirma el envío de tus datos y genera un análisis para ver observaciones y próximos pasos.'
                  : 'Registra un estado de ánimo para generar una reflexión sobre este período.'}
              </p>
            </div>
          )}
        </section>

        {/* Actividad Reciente */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <Clock className='w-5 h-5 mr-2 text-gray-600 dark:text-gray-300' />
            Actividad Reciente
          </h3>

          {(() => {
            // Combinar todas las actividades
            const allActivities: Array<{
              type: 'mood' | 'journal' | 'appointment';
              title: string;
              description: string;
              date: Date;
              icon: string;
              color: string;
            }> = [];

            // Agregar registros de estado de ánimo
            if (moodLogs.length) {
              moodLogs.forEach((log: MoodLog) => {
                const date = toDate(log.createdAt);
                if (!date) return;
                allActivities.push({
                  type: 'mood',
                  title: 'Estado de ánimo registrado',
                  description: `Nivel ${log.mood}/10 - ${getMoodLevel(log.mood).level}`,
                  date,
                  icon: getMoodLevel(log.mood).icon,
                  color: 'purple',
                });
              });
            }

            // Agregar entradas de diario
            journalEntries.forEach((entry) => {
              allActivities.push({
                type: 'journal',
                title: 'Entrada de diario creada',
                description: entry.title || 'Sin título',
                date: new Date(entry.date),
                icon: '📝',
                color: 'blue',
              });
            });

            // Ordenar por fecha (más reciente primero)
            allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

            if (allActivities.length === 0) {
              return (
                <div className='text-center py-8 text-gray-500'>
                  <Activity className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p>No hay actividad reciente</p>
                  <p className='text-sm'>Comienza registrando tu estado de ánimo</p>
                </div>
              );
            }

            return (
              <div className='space-y-3'>
                {allActivities.slice(0, 10).map((activity, index) => (
                  <div key={index} className='flex flex-col gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex min-w-0 items-start gap-3'>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                        activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                        'bg-green-100 dark:bg-green-900'
                      }`}>
                        <span className='text-sm'>{activity.icon}</span>
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>{activity.title}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{activity.description}</p>
                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                          {formatDateColombian(activity.date)} a las{' '}
                          {formatTimeColombian(activity.date)}
                        </p>
                      </div>
                    </div>
                    <div className={`self-start whitespace-nowrap rounded-full px-2 py-1 text-xs sm:self-auto ${
                      activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' :
                      activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    }`}>
                      {activity.type === 'mood' ? 'Estado de ánimo' :
                       activity.type === 'journal' ? 'Diario' : 'Cita'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default Statistics;
