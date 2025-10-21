import { AlertTriangle, Calendar, CheckCircle, Clock, Download, FileText, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadReport } from '../services/pdfReportService';
import { getRealMoodData } from '../services/realDataService';
import { moodAnalyzerAgent } from '../services/specializedAgents';

// Interfaces locales para evitar problemas de importación
interface AdvancedReport {
  id?: string;
  userId: string;
  reportType: 'mood_analysis' | 'chat_analysis' | 'crisis_assessment' | 'weekly_summary' | 'monthly_summary';
  title: string;
  content: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  data?: any;
  period?: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
}

const AdvancedReports: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<AdvancedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Escuchar cambios en el tema desde otros componentes
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setIsDarkMode(currentTheme === 'dark');
    };

    // Agregar listener para cambios de tema
    window.addEventListener('storage', handleThemeChange);
    
    // También escuchar cambios en el mismo tab
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme');
      const newDarkMode = currentTheme === 'dark';
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
        
        // Aplicar clases CSS inmediatamente
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }, 50); // Reducir intervalo para respuesta más rápida

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

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

  const getPeriodDates = () => {
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
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
    }

    return { start, end };
  };

  const generateMoodReport = async () => {
    setLoading(true);
    try {
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      const { start, end } = getPeriodDates();

      // Obtener datos reales de Firebase
      const realMoodData = await getRealMoodData(user.uid, start, end);

      if (realMoodData.moodLogs.length === 0) {
        toast.error(
          'No hay datos de estado de ánimo para el período seleccionado. Por favor, registra algunos estados de ánimo antes de generar el reporte.'
        );
        return;
      }

      // Usar el agente de IA para analizar los datos reales
      const aiAnalysis = await moodAnalyzerAgent.analyzeMood(realMoodData);

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
      toast.success(`Reporte generado exitosamente con ${realMoodData.moodLogs.length} registros reales`);
    } catch (error) {
      console.error('Error generating mood report:', error);
      toast.error(
        'Error al generar el reporte de estado de ánimo. Por favor, intenta nuevamente o contacta soporte si el problema persiste.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateDiaryReport = async () => {
    setLoading(true);
    try {
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      const { start, end } = getPeriodDates();

      // Obtener datos del diario (simulados por ahora, se integrará con el servicio real)
      const diaryData = {
        entries: [
          {
            date: new Date(),
            content: 'Hoy me siento bien, tuve un buen día en el trabajo.',
            mood: 8,
            tags: ['trabajo', 'positivo'],
          },
          {
            date: new Date(Date.now() - 86400000),
            content: 'Ayer fue un día difícil, tuve muchas responsabilidades.',
            mood: 5,
            tags: ['estrés', 'trabajo'],
          },
        ],
        period: { start, end },
      };

      if (diaryData.entries.length === 0) {
        toast.error(
          'No hay entradas de diario para el período seleccionado. Por favor, escribe algunas entradas en tu diario antes de generar el reporte.'
        );
        return;
      }

      // Usar el agente de IA para analizar el diario
      const moodData = {
        moodLogs: diaryData.entries.map((entry) => ({
          mood: entry.mood,
          date: entry.date,
          notes: entry.content,
        })),
        period: { start, end },
      };

      const aiAnalysis = await moodAnalyzerAgent.analyzeMood(moodData);

      // Crear reporte con análisis de IA
      const report: AdvancedReport = {
        userId: user.uid,
        reportType: 'diary_analysis',
        title: `Análisis de Diario - ${start.toLocaleDateString()} a ${end.toLocaleDateString()}`,
        content: aiAnalysis.summary || 'Análisis de tu diario personal durante el período seleccionado.',
        insights: aiAnalysis.insights || ['Tu diario muestra reflexiones regulares'],
        recommendations: aiAnalysis.recommendations || ['Continúa escribiendo en tu diario'],
        riskLevel: aiAnalysis.riskLevel || 'low',
        period: { start, end },
        createdAt: new Date(),
        data: {
          ...aiAnalysis,
          realData: {
            totalEntries: diaryData.entries.length,
            averageMood: diaryData.entries.reduce((sum, entry) => sum + entry.mood, 0) / diaryData.entries.length,
            uniqueTags: [...new Set(diaryData.entries.flatMap((entry) => entry.tags))].length,
          },
        },
      };

      // Simular guardado
      setReports((prev) => [report, ...prev]);
      toast.success(`Reporte de diario generado exitosamente con ${diaryData.entries.length} entradas`);
    } catch (error) {
      console.error('Error generating diary report:', error);
      toast.error(
        'Error al generar el reporte de diario. Por favor, intenta nuevamente o contacta soporte si el problema persiste.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report: AdvancedReport) => {
    try {
      if (!user?.uid) {
        toast.error('Usuario no autenticado');
        return;
      }

      toast.loading('Generando reporte PDF...', { id: 'pdf-generation' });

      const reportData = {
        title: report.title,
        period: report.period,
        userId: user.uid,
        type: report.reportType === 'mood_analysis' ? 'mood' : 'diary',
      };

      await generateAndDownloadReport(reportData.type, reportData);

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
        <div className={`p-6 rounded-lg shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Generar Nuevo Reporte</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
          <div className='flex flex-col sm:flex-row gap-4 mt-6'>
            <button
              onClick={generateMoodReport}
              disabled={loading}
              className='flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base'
            >
              <TrendingUp className='w-4 h-4 sm:w-5 sm:h-5' />
              <span className='hidden sm:inline'>Generar Reporte de Estado de Ánimo</span>
              <span className='sm:hidden'>Reporte de Ánimo</span>
            </button>

            <button
              onClick={generateDiaryReport}
              disabled={loading}
              className='flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base'
            >
              <FileText className='w-4 h-4 sm:w-5 sm:h-5' />
              <span className='hidden sm:inline'>Generar Reporte de Diario</span>
              <span className='sm:hidden'>Reporte de Diario</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reportes Generados</h2>

          {reports.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-lg`}>No hay reportes generados aún</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Genera tu primer reporte usando los controles de arriba</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h3 className='text-lg font-semibold'>{report.title}</h3>
                        <span
                          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                            report.riskLevel
                          )}`}
                        >
                          {getRiskLevelIcon(report.riskLevel)}
                          <span className='ml-1'>{report.riskLevel.toUpperCase()}</span>
                        </span>
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
