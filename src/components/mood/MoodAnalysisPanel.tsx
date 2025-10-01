import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Activity, Brain, Heart, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { analyzeMoodWithAI } from '../../services/openai';

interface MoodAnalysisPanelProps {
  userId: string;
  currentMoodData: {
    mood: number;
    energy: number;
    stress: number;
    sleep: number;
    notes: string;
    activities: string[];
    emotions: string[];
  };
  isDarkMode: boolean;
  onAnalysisComplete?: (analysis: any) => void;
}

interface MoodTrend {
  period: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface MoodInsight {
  type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

const MoodAnalysisPanel: React.FC<MoodAnalysisPanelProps> = ({
  userId,
  currentMoodData,
  isDarkMode,
  onAnalysisComplete,
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [trends, setTrends] = useState<MoodTrend[]>([]);
  const [insights, setInsights] = useState<MoodInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Escuchar cambios en mood logs para calcular tendencias
    const moodLogsQuery = query(
      collection(db, 'moodLogs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(moodLogsQuery, (querySnapshot) => {
      const moodLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      calculateTrends(moodLogs);
    });

    return () => unsubscribe();
  }, [userId]);

  const calculateTrends = (moodLogs: any[]) => {
    if (moodLogs.length < 2) return;

    const now = new Date();
    const periods = [
      { name: 'Última semana', days: 7 },
      { name: 'Últimas 2 semanas', days: 14 },
      { name: 'Último mes', days: 30 },
    ];

    const calculatedTrends: MoodTrend[] = periods
      .map((period) => {
        const cutoffDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
        const recentLogs = moodLogs.filter((log) => log.createdAt >= cutoffDate);
        const olderLogs = moodLogs.filter((log) => log.createdAt < cutoffDate);

        if (recentLogs.length === 0) return null;

        const recentAvg = recentLogs.reduce((sum, log) => sum + log.mood, 0) / recentLogs.length;
        const olderAvg =
          olderLogs.length > 0 ? olderLogs.reduce((sum, log) => sum + log.mood, 0) / olderLogs.length : recentAvg;

        const change = recentAvg - olderAvg;
        const trend: 'up' | 'down' | 'stable' = change > 0.2 ? 'up' : change < -0.2 ? 'down' : 'stable';

        return {
          period: period.name,
          average: recentAvg,
          trend,
          change: Math.abs(change),
        };
      })
      .filter(Boolean) as MoodTrend[];

    setTrends(calculatedTrends);
  };

  const generateInsights = (analysis: any, trends: MoodTrend[]) => {
    const newInsights: MoodInsight[] = [];

    // Insight basado en tendencia
    if (trends.length > 0) {
      const mainTrend = trends[0];
      if (mainTrend.trend === 'up') {
        newInsights.push({
          type: 'achievement',
          title: '¡Tendencia Positiva!',
          description: `Tu estado de ánimo ha mejorado ${mainTrend.change.toFixed(1)} puntos en la última semana.`,
          icon: <TrendingUp className='w-5 h-5 text-green-600' />,
          priority: 'high',
        });
      } else if (mainTrend.trend === 'down') {
        newInsights.push({
          type: 'warning',
          title: 'Tendencia Preocupante',
          description: `Tu estado de ánimo ha disminuido ${mainTrend.change.toFixed(
            1
          )} puntos. Considera buscar apoyo.`,
          icon: <TrendingDown className='w-5 h-5 text-red-600' />,
          priority: 'high',
        });
      }
    }

    // Insight basado en análisis de IA
    if (analysis?.insights) {
      analysis.insights.forEach((insight: any) => {
        newInsights.push({
          type: 'recommendation',
          title: insight.title,
          description: insight.description,
          icon: <Brain className='w-5 h-5 text-blue-600' />,
          priority: insight.priority || 'medium',
        });
      });
    }

    // Insight basado en patrones de actividad
    if (currentMoodData.activities.length > 0) {
      const socialActivities = currentMoodData.activities.filter((activity) =>
        ['social', 'amigos', 'familia'].includes(activity.toLowerCase())
      );

      if (socialActivities.length > 0 && currentMoodData.mood >= 4) {
        newInsights.push({
          type: 'pattern',
          title: 'Actividad Social Beneficiosa',
          description: 'Las actividades sociales están correlacionadas con tu buen estado de ánimo.',
          icon: <Heart className='w-5 h-5 text-pink-600' />,
          priority: 'medium',
        });
      }
    }

    // Insight basado en sueño y energía
    if (currentMoodData.sleep <= 3 && currentMoodData.energy <= 3) {
      newInsights.push({
        type: 'recommendation',
        title: 'Mejora tu Descanso',
        description: 'Tu sueño y energía están bajos. Considera mejorar tu rutina de descanso.',
        icon: <Activity className='w-5 h-5 text-purple-600' />,
        priority: 'high',
      });
    }

    setInsights(newInsights);
  };

  const performAnalysis = async () => {
    if (!currentMoodData) return;

    setLoading(true);
    setError(null);

    try {
      // Realizar análisis con IA
      const aiAnalysis = await analyzeMoodWithAI(currentMoodData);

      // Generar insights basados en análisis y tendencias
      generateInsights(aiAnalysis, trends);

      setAnalysis(aiAnalysis);

      if (onAnalysisComplete) {
        onAnalysisComplete(aiAnalysis);
      }
    } catch (err) {
      console.error('Error en análisis de mood:', err);
      setError('Error al realizar el análisis. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'text-green-600';
      case 'warning':
        return 'text-red-600';
      case 'recommendation':
        return 'text-blue-600';
      case 'pattern':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className='flex items-center justify-between mb-6'>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🧠 Análisis Inteligente</h3>
        <button
          onClick={performAnalysis}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {loading ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Analizando...</span>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <Zap className='w-4 h-4' />
              <span>Analizar con IA</span>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {/* Tendencias */}
      {trends.length > 0 && (
        <div className='mb-6'>
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📈 Tendencias de Estado de Ánimo
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {trends.map((trend, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {trend.period}
                  </span>
                  {trend.trend === 'up' && <TrendingUp className='w-4 h-4 text-green-600' />}
                  {trend.trend === 'down' && <TrendingDown className='w-4 h-4 text-red-600' />}
                  {trend.trend === 'stable' && <Activity className='w-4 h-4 text-gray-600' />}
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {trend.average.toFixed(1)}/5
                </div>
                <div
                  className={`text-sm ${
                    trend.trend === 'up' ? 'text-green-600' : trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {trend.trend === 'up' ? '↗️ Mejorando' : trend.trend === 'down' ? '↘️ Declinando' : '→ Estable'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className='mb-6'>
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💡 Insights y Recomendaciones
          </h4>
          <div className='space-y-3'>
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                <div className='flex items-start space-x-3'>
                  <div className={`${getInsightTypeColor(insight.type)} mt-0.5`}>{insight.icon}</div>
                  <div className='flex-1'>
                    <h5 className='font-medium text-gray-900 mb-1'>{insight.title}</h5>
                    <p className='text-sm text-gray-700'>{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análisis de IA */}
      {analysis && (
        <div>
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🤖 Análisis de IA
          </h4>
          <div
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='space-y-3'>
              {analysis.summary && (
                <div>
                  <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen</h5>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{analysis.summary}</p>
                </div>
              )}

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones</h5>
                  <ul className='space-y-1'>
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodAnalysisPanel;
