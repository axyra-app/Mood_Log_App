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
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useMood } from '../hooks/useMood';
import { useUserAppointments } from '../hooks/useUserAppointments';
import { aiService } from '../services/aiService';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const { statistics, loading, getMoodTrend, getAverageMood, getMoodStreak } = useMood();
  const { entries: journalEntries, getJournalStats } = useJournal(user?.uid || '');
  const { appointments } = useUserAppointments(user?.uid || '');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Función para exportar estadísticas como PDF
  const exportStatistics = async () => {
    try {
      // Importar jsPDF dinámicamente
      const { default: jsPDF } = await import('jspdf');
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
        addText('Análisis Profesional con IA', 16, true, '#374151');
        yPosition += 5;

        if (aiAnalysis.summary) {
          addText('Resumen:', 14, true, '#374151');
          addText(aiAnalysis.summary, 12, false, '#6B7280');
          yPosition += 5;
        }

        if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
          addText('Recomendaciones:', 14, true, '#374151');
          aiAnalysis.recommendations.forEach((rec: string) => {
            addText(`• ${rec}`, 12, false, '#6B7280');
          });
          yPosition += 5;
        }
      }

      // Actividad reciente
      if (statistics?.moodLogs && statistics.moodLogs.length > 0) {
        addText('Actividad Reciente', 16, true, '#374151');
        yPosition += 5;

        const recentLogs = statistics.moodLogs.slice(0, 10);
        recentLogs.forEach((log: any) => {
          const date = new Date(log.createdAt).toLocaleDateString('es-CO');
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
      const moodLogs = statistics?.moodLogs?.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate >= startDate && logDate <= endDate;
      }) || [];

      // Crear datos para el análisis de IA
      const moodData = {
        overallMood: getAverageMood(timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365),
        energy: moodLogs.length > 0 ? moodLogs.reduce((sum, log) => sum + (log.energy || 5), 0) / moodLogs.length : 5,
        stress: moodLogs.length > 0 ? moodLogs.reduce((sum, log) => sum + (log.stress || 5), 0) / moodLogs.length : 5,
        sleep: moodLogs.length > 0 ? moodLogs.reduce((sum, log) => sum + (log.sleep || 5), 0) / moodLogs.length : 5,
        emotions: moodLogs.flatMap(log => log.emotions || []),
        activities: moodLogs.flatMap(log => log.activities || []),
        feelings: moodLogs.length > 0 ? moodLogs[moodLogs.length - 1]?.feelings || '' : '',
      };

      const analysis = await aiService.analyzeMood(moodData);
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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Header 
        title="Estadísticas de Bienestar"
        subtitle="Análisis de tu progreso emocional"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
        actions={
          <div className='flex items-center space-x-4'>
            <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
              className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
            >
              <Download className='w-4 h-4' />
              <span>Exportar</span>
            </button>
          </div>
        }
      />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Información del Período */}
        <div className='mb-6'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Período: {formatDateColombian(getPeriodData().startDate)} - {formatDateColombian(getPeriodData().endDate)}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Estado de Ánimo Promedio</p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>{periodStats.averageMood.toFixed(1)}</p>
                <p className={`text-sm font-medium ${moodLevel.color}`}>
                  {moodLevel.icon} {moodLevel.level}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center'>
                <Heart className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
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

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
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

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
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
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                <span className='text-white text-lg'>🧠</span>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Análisis Profesional con IA</h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Insights psicológicos basados en tus datos</p>
              </div>
            </div>

            <button
              onClick={generateAIAnalysis}
              disabled={analyzing}
              className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50'
            >
              <span className='text-lg'>🧠</span>
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
                  <div className='space-y-4'>
                    {aiAnalysis.recommendations.map((rec: any, index: number) => (
                      <div
                        key={index}
                        className='bg-purple-50 rounded-lg p-4 border border-purple-200'
                      >
                        <div className='flex items-start space-x-3'>
                          <Target className='w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0' />
                          <div className='flex-1'>
                            <h5 className='font-semibold text-purple-800 mb-2'>{rec.title}</h5>
                            <p className='text-sm text-purple-700 mb-2'>{rec.description}</p>
                            <div className='bg-white rounded p-3 border border-purple-100'>
                              <p className='text-sm text-gray-800 whitespace-pre-line'>{rec.actionable}</p>
                            </div>
                            <div className='mt-2'>
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600'>
                                {rec.category}
                              </span>
                            </div>
                          </div>
                        </div>
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
              <div className='w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🧠</span>
              </div>
              <p className='font-medium'>Análisis Inteligente de tu Bienestar</p>
              <p className='text-sm'>Haz clic en "Generar Análisis" para obtener insights personalizados</p>
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
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
            if (statistics?.moodLogs) {
              statistics.moodLogs.forEach((log) => {
                allActivities.push({
                  type: 'mood',
                  title: 'Estado de ánimo registrado',
                  description: `Nivel ${log.mood}/5 - ${getMoodLevel(log.mood).level}`,
                  date: new Date(log.createdAt),
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

            // Agregar citas
            appointments.forEach((apt) => {
              allActivities.push({
                type: 'appointment',
                title: 'Cita programada',
                description: `Con ${apt.psychologistName || 'psicólogo'} - ${apt.status}`,
                date: new Date(apt.appointmentDate),
                icon: '📅',
                color: 'green',
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
                  <div key={index} className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                        activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                        'bg-green-100 dark:bg-green-900'
                      }`}>
                        <span className='text-sm'>{activity.icon}</span>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>{activity.title}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{activity.description}</p>
                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                          {formatDateColombian(activity.date)} a las{' '}
                          {formatTimeColombian(activity.date)}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
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
      </div>
    </div>
  );
};

export default Statistics;
