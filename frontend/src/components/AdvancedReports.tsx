import { AlertTriangle, Calendar, CheckCircle, Clock, Download, FileText, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateAndDownloadReport } from '../services/pdfReportService';
import { getRealMoodData } from '../services/realDataService';
import { moodAnalyzerAgent } from '../services/specializedAgents';
import { prepareMoodAnalysis } from '../utils/moodAnalysisPayload';
import { analyzeJournalEntry, getJournalEntriesByDateRange } from '../services/journalService';

// Interfaces locales para evitar problemas de importación
interface AdvancedReport {
  id?: string;
  userId: string;
  reportType: 'mood_analysis' | 'diary_analysis' | 'chat_analysis' | 'crisis_assessment' | 'weekly_summary' | 'monthly_summary';
  title: string;
  content: string;
  insights: string[];
  recommendations: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  data?: any;
  period?: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
}

const AdvancedReports: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState<AdvancedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [lastReportDate, setLastReportDate] = useState<string | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<{hours: number, minutes: number} | null>(null);
  const [aiDataConsent, setAiDataConsent] = useState(false);


  // Actualizar contador de tiempo cada minuto
  useEffect(() => {
    const updateTimer = () => {
      const timeLeft = getTimeUntilNextReport();
      setTimeUntilNext(timeLeft);
    };

    updateTimer(); // Actualizar inmediatamente
    const interval = setInterval(updateTimer, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [lastReportDate]);

  useEffect(() => {
    if (user) {
      loadReports();
      // Cargar la fecha del último reporte
      const lastReport = localStorage.getItem(`lastReportDate_${user.uid}`);
      setLastReportDate(lastReport);
    }
  }, [user]);

  const canGenerateReport = () => {
    if (!lastReportDate) return true;
    
    const lastReport = new Date(lastReportDate);
    const now = new Date();
    const diffTime = now.getTime() - lastReport.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    return diffHours >= 24; // Al menos 24 horas entre reportes
  };

  const getTimeUntilNextReport = () => {
    if (!lastReportDate) return null;
    
    const lastReport = new Date(lastReportDate);
    const now = new Date();
    const diffTime = now.getTime() - lastReport.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours >= 24) return null;
    
    const remainingHours = 24 - diffHours;
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    
    return { hours, minutes };
  };

  const loadReports = async () => {
    if (!user) return;

    try {
      // Simular carga de reportes por ahora
      setReports([]);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar los reportes');
    }
  };

  const getPeriodDates = (): { start: Date; end: Date } | null => {
    const now = new Date();
    let start: Date, end: Date;

    switch (selectedPeriod) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return null;
        start = new Date(`${customStartDate}T00:00:00`);
        end = new Date(`${customEndDate}T23:59:59.999`);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
    }

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
      return null;
    }
    return { start, end };
  };

  const generateMoodReport = async () => {
    if (!aiDataConsent) {
      toast.error('Confirma el envío de estos datos antes de solicitar el análisis.');
      return;
    }
    if (!canGenerateReport()) {
      const timeLeft = getTimeUntilNextReport();
      if (timeLeft) {
        toast.error(`Debes esperar ${timeLeft.hours}h ${timeLeft.minutes}m para generar otro reporte.`);
      } else {
        toast.error('Solo puedes generar un reporte cada 24 horas.');
      }
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      const period = getPeriodDates();
      if (!period) {
        toast.error('Selecciona un período válido para generar el reporte.');
        return;
      }
      const { start, end } = period;

      // Obtener datos reales de Firebase
      const realMoodData = await getRealMoodData(user.uid, start, end);

      if (realMoodData.moodLogs.length === 0) {
        toast.error(
          'No hay datos de estado de ánimo para el período seleccionado. Por favor, registra algunos estados de ánimo antes de generar el reporte.'
        );
        return;
      }

      // Usar el agente de IA para analizar los datos reales
      const aiAnalysis = await moodAnalyzerAgent.analyzeMood(prepareMoodAnalysis(
        realMoodData.moodLogs,
        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      ).moodData);

      // Crear reporte con análisis de IA
      const report: AdvancedReport = {
        userId: user.uid,
        reportType: 'mood_analysis',
        title: `Análisis de Estado de Ánimo - ${start.toLocaleDateString()} a ${end.toLocaleDateString()}`,
        content: aiAnalysis.summary || 'Análisis detallado de tu estado de ánimo durante el período seleccionado.',
        insights: aiAnalysis.insights || ['Tu estado de ánimo general es positivo'],
        recommendations: aiAnalysis.recommendations || ['Continúa con tu rutina de bienestar'],
        riskLevel: aiAnalysis.riskLevel || 'low',
        period: { start, end },
        createdAt: new Date(),
        data: {
          ...aiAnalysis,
          realData: {
            totalLogs: realMoodData.moodLogs.length,
            averageMood: realMoodData.moodLogs.reduce((sum, log) => sum + log.mood, 0) / realMoodData.moodLogs.length,
            moodRange: {
              min: Math.min(...realMoodData.moodLogs.map((log) => log.mood)),
              max: Math.max(...realMoodData.moodLogs.map((log) => log.mood)),
            },
          },
        },
      };

      // Simular guardado
      setReports((prev) => [report, ...prev]);
      
      // Actualizar fecha del último reporte
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`lastReportDate_${user.uid}`, today);
      setLastReportDate(today);
      
      toast.success(`Reporte generado exitosamente con ${realMoodData.moodLogs.length} registros reales`);
    } catch (error) {
      console.error('Error generating mood report:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al generar el reporte de estado de ánimo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateDiaryReport = async () => {
    if (!aiDataConsent) {
      toast.error('Confirma el envío de estas entradas antes de solicitar el análisis.');
      return;
    }
    if (!canGenerateReport()) {
      const timeLeft = getTimeUntilNextReport();
      if (timeLeft) {
        toast.error(`Debes esperar ${timeLeft.hours}h ${timeLeft.minutes}m para generar otro reporte.`);
      } else {
        toast.error('Solo puedes generar un reporte cada 24 horas.');
      }
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      const period = getPeriodDates();
      if (!period) {
        toast.error('Selecciona un período válido para generar el reporte.');
        return;
      }
      const { start, end } = period;

      const entries = await getJournalEntriesByDateRange(user.uid, start, end);

      if (entries.length === 0) {
        toast.error(
          'No hay entradas de diario para el período seleccionado. Por favor, escribe algunas entradas en tu diario antes de generar el reporte.'
        );
        return;
      }

      const journalContent = entries
        .map((entry) => `${entry.date.toLocaleDateString()} - ${entry.title}\n${entry.content}`)
        .join('\n\n')
        .slice(0, 5_000);
      if (!journalContent.trim()) {
        toast.error('Las entradas del período no contienen texto para analizar.');
        return;
      }
      const aiAnalysis = await analyzeJournalEntry(journalContent);

      // Crear reporte con análisis de IA
      const report: AdvancedReport = {
        userId: user.uid,
        reportType: 'diary_analysis',
        title: `Análisis de Diario - ${start.toLocaleDateString()} a ${end.toLocaleDateString()}`,
        content: aiAnalysis.summary,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        period: { start, end },
        createdAt: new Date(),
        data: {
          ...aiAnalysis,
          realData: {
            totalEntries: entries.length,
            uniqueTags: [...new Set(entries.flatMap((entry) => entry.tags))].length,
          },
        },
      };

      // Simular guardado
      setReports((prev) => [report, ...prev]);
      toast.success(`Reporte de diario generado con ${entries.length} entradas reales.`);
    } catch (error) {
      console.error('Error generating diary report:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al generar el reporte de diario.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report: AdvancedReport) => {
    try {
      if (!aiDataConsent) {
        toast.error('Confirma el envío de datos antes de generar el PDF con análisis de IA.');
        return;
      }
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      toast.loading('Generando reporte PDF...', { id: 'pdf-generation' });

      const reportType: 'mood' | 'diary' = report.reportType === 'mood_analysis' ? 'mood' : 'diary';
      const reportData = {
        title: report.title,
        period: report.period || { start: new Date(), end: new Date() },
        userId: user.uid,
        type: reportType,
      };

      await generateAndDownloadReport(reportType, reportData);

      toast.success('Reporte PDF generado exitosamente', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al generar el reporte PDF', { id: 'pdf-generation' });
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className='w-4 h-4' />;
      case 'medium':
        return <Clock className='w-4 h-4' />;
      case 'low':
        return <CheckCircle className='w-4 h-4' />;
      default:
        return <FileText className='w-4 h-4' />;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <Header 
        title="Reportes Avanzados"
        subtitle="Análisis detallados de tu bienestar emocional"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
      />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>

        {/* Controls */}
        <div className={`p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Generar Nuevo Reporte</h2>
          <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Al generar un análisis con IA, se enviarán los registros del período seleccionado a Groq para procesarlos. No incluyas información que no quieras compartir con un proveedor externo.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
            {/* Period Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Período de Análisis</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'custom')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value='week'>Última Semana</option>
                <option value='month'>Último Mes</option>
                <option value='custom'>Período Personalizado</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === 'custom' && (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Inicio</label>
                  <input
                    type='date'
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Fin</label>
                  <input
                    type='date'
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6'>
            <button
              onClick={generateMoodReport}
              disabled={loading || !canGenerateReport()}
              className='flex items-center justify-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm'
            >
              <TrendingUp className='w-3 h-3 sm:w-4 sm:h-4' />
              {timeUntilNext ? (
                <span className='text-xs sm:text-sm'>
                  Esperar {timeUntilNext.hours}h {timeUntilNext.minutes}m
                </span>
              ) : (
                <>
                  <span className='hidden sm:inline'>Generar Reporte de Estado de Ánimo</span>
                  <span className='sm:hidden'>Reporte de Ánimo</span>
                </>
              )}
            </button>

            <button
              onClick={generateDiaryReport}
              disabled={loading || !canGenerateReport()}
              className='flex items-center justify-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm'
            >
              <FileText className='w-4 h-4 sm:w-5 sm:h-5' />
              {timeUntilNext ? (
                <span className='text-xs sm:text-sm'>
                  Esperar {timeUntilNext.hours}h {timeUntilNext.minutes}m
                </span>
              ) : (
                <>
                  <span className='hidden sm:inline'>Generar Reporte de Diario</span>
                  <span className='sm:hidden'>Reporte de Diario</span>
                </>
              )}
            </button>
          </div>
          <label className={`mt-4 flex items-start gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type='checkbox'
              checked={aiDataConsent}
              onChange={(event) => setAiDataConsent(event.target.checked)}
              className='mt-1 h-4 w-4 shrink-0 accent-purple-600'
            />
            <span>
              Acepto enviar los registros o entradas del período seleccionado a Groq mediante el servicio de IA para generar este análisis y su PDF.
            </span>
          </label>
        </div>

        {/* Reports List */}
        <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reportes Generados</h2>

          {reports.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-lg`}>No hay reportes generados aún</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Genera tu primer reporte usando los controles de arriba</p>
            </div>
          ) : (
            <div className='space-y-3 sm:space-y-4'>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-3 sm:p-4 border rounded-lg ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                    <div className='flex-1'>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
                        <h3 className='text-base sm:text-lg font-semibold'>{report.title}</h3>
                        {report.riskLevel && (
                          <span
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                              report.riskLevel
                            )}`}
                          >
                            {getRiskLevelIcon(report.riskLevel)}
                            <span className='ml-1'>{report.riskLevel.toUpperCase()}</span>
                          </span>
                        )}
                      </div>

                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{report.content}</p>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Insights:</h4>
                          <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                            {report.insights.map((insight, idx) => (
                              <li key={idx}>• {insight}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones:</h4>
                          <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                            {report.recommendations.map((rec, idx) => (
                              <li key={idx}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2 ml-4'>
                      <button
                        onClick={() => downloadReport(report)}
                        className={`p-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} rounded-lg transition-colors`}
                        title='Descargar Reporte'
                      >
                        <Download className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className='flex items-center'>
                        <Calendar className='w-4 h-4 mr-1' />
                        Generado: {report.createdAt.toLocaleDateString()}
                      </span>
                      {report.period && (
                        <span>
                          Período: {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;
