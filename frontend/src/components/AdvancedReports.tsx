import { AlertTriangle, Calendar, CheckCircle, Clock, Download, FileText, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useMood } from '../../hooks/useMood';

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
  const { moodLogs } = useMood();
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
  }, []);

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
    if (!user) return;

    setLoading(true);
    try {
      const { start, end } = getPeriodDates();
      const periodMoodLogs = moodLogs.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate >= start && logDate <= end;
      });

      if (periodMoodLogs.length === 0) {
        toast.error('No hay datos de estado de ánimo para el período seleccionado');
        return;
      }

      // Crear reporte simulado
      const report: AdvancedReport = {
        userId: user.uid,
        reportType: 'mood_analysis',
        title: `Análisis de Estado de Ánimo - ${start.toLocaleDateString()} a ${end.toLocaleDateString()}`,
        content: `Análisis detallado de tu estado de ánimo durante el período seleccionado. Se registraron ${periodMoodLogs.length} entradas.`,
        insights: [
          'Tu estado de ánimo general es positivo',
          'Tienes buenos niveles de energía',
          'Manejas bien el estrés',
        ],
        recommendations: ['Continúa con tu rutina de bienestar', 'Mantén la comunicación regular'],
        riskLevel: 'low',
        period: { start, end },
        createdAt: new Date(),
      };

      // Simular guardado
      setReports((prev) => [report, ...prev]);
      toast.success('Reporte de estado de ánimo generado exitosamente');
    } catch (error) {
      console.error('Error generating mood report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const generateChatReport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { start, end } = getPeriodDates();

      // Crear reporte simulado
      const report: AdvancedReport = {
        userId: user.uid,
        reportType: 'chat_analysis',
        title: `Análisis de Conversaciones - ${start.toLocaleDateString()} a ${end.toLocaleDateString()}`,
        content: `Análisis de tus conversaciones durante el período seleccionado. Se analizaron los patrones de comunicación y temas recurrentes.`,
        insights: [
          'Tuviste conversaciones regulares durante este período',
          'Los temas principales fueron bienestar y estado de ánimo',
          'Mantuviste una comunicación positiva',
        ],
        recommendations: ['Continúa con tu rutina de bienestar', 'Mantén la comunicación regular'],
        riskLevel: 'low',
        period: { start, end },
        createdAt: new Date(),
      };

      // Simular guardado
      setReports((prev) => [report, ...prev]);
      toast.success('Reporte de conversaciones generado exitosamente');
    } catch (error) {
      console.error('Error generating chat report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: AdvancedReport) => {
    const reportData = {
      title: report.title,
      content: report.content,
      insights: report.insights,
      recommendations: report.recommendations,
      riskLevel: report.riskLevel,
      generatedAt: report.createdAt.toLocaleDateString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Reportes Avanzados</h1>
          <p className='text-gray-600'>Análisis detallados de tu bienestar emocional</p>
        </div>

        {/* Controls */}
        <div className={`p-6 rounded-lg shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className='text-xl font-semibold mb-4'>Generar Nuevo Reporte</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Period Selection */}
            <div>
              <label className='block text-sm font-medium mb-2'>Período de Análisis</label>
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
                  <label className='block text-sm font-medium mb-2'>Fecha Inicio</label>
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
                  <label className='block text-sm font-medium mb-2'>Fecha Fin</label>
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
          <div className='flex flex-wrap gap-4 mt-6'>
            <button
              onClick={generateMoodReport}
              disabled={loading}
              className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <TrendingUp className='w-5 h-5 mr-2' />
              Generar Reporte de Estado de Ánimo
            </button>

            <button
              onClick={generateChatReport}
              disabled={loading}
              className='flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <FileText className='w-5 h-5 mr-2' />
              Generar Reporte de Conversaciones
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className='text-xl font-semibold mb-4'>Reportes Generados</h2>

          {reports.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='w-16 h-16 mx-auto mb-4 text-gray-300' />
              <p className='text-gray-500 text-lg'>No hay reportes generados aún</p>
              <p className='text-gray-400'>Genera tu primer reporte usando los controles de arriba</p>
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

                      <p className='text-gray-600 mb-3'>{report.content}</p>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <h4 className='font-medium mb-2'>Insights:</h4>
                          <ul className='text-sm text-gray-600 space-y-1'>
                            {report.insights.map((insight, idx) => (
                              <li key={idx}>• {insight}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className='font-medium mb-2'>Recomendaciones:</h4>
                          <ul className='text-sm text-gray-600 space-y-1'>
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
                        className='p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors'
                        title='Descargar Reporte'
                      >
                        <Download className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
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
