import { useEffect, useState } from 'react';
import { getMoodLogsRealtime } from '../services/firestore';
import {
  ContextualData,
  analyzeLongTermTrends,
  analyzeMoodWithAI,
  generatePersonalizedInsights,
} from '../services/openai';
import { AIAnalysis, MoodLog } from '../types';

export const useMood = (userId?: string) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [longTermTrends, setLongTermTrends] = useState<any>(null);

  // Cargar mood logs en tiempo real si se proporciona userId
  useEffect(() => {
    if (userId) {
      const unsubscribe = getMoodLogsRealtime(userId, (logs) => {
        setMoodLogs(logs);
        // Generar insights cuando se actualicen los logs
        if (logs.length > 0) {
          generateInsights(logs);
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  // Generar insights personalizados
  const generateInsights = async (logs: MoodLog[]) => {
    try {
      const userPreferences = {
        preferredActivities: ['ejercicio', 'lectura', 'música'],
        goals: ['mejorar bienestar', 'reducir estrés'],
        lifestyle: 'activo',
      };

      const contextualData: ContextualData = {
        timeOfDay: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        dayOfWeek: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
        userHistory: logs.slice(0, 10),
        personalPreferences: userPreferences,
        currentGoals: ['mejorar bienestar', 'reducir estrés'],
        lifestyleFactors: ['trabajo', 'ejercicio', 'social'],
      };

      const newInsights = await generatePersonalizedInsights(logs, userPreferences, contextualData);
      setInsights(newInsights);

      // Analizar tendencias a largo plazo si hay suficientes datos
      if (logs.length >= 7) {
        const trends = await analyzeLongTermTrends(logs);
        setLongTermTrends(trends);
      }
    } catch (error) {
      console.error('Error generando insights:', error);
    }
  };

  // Análisis de IA mejorado con contexto
  const analyzeMoodWithAIEnhanced = async (moodData: Partial<MoodLog>): Promise<AIAnalysis> => {
    try {
      setLoading(true);

      // Preparar datos contextuales
      const contextualData: ContextualData = {
        timeOfDay: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        dayOfWeek: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
        userHistory: moodLogs.slice(0, 10),
        personalPreferences: {
          preferredActivities: ['ejercicio', 'lectura', 'música'],
          goals: ['mejorar bienestar', 'reducir estrés'],
          lifestyle: 'activo',
        },
        currentGoals: ['mejorar bienestar', 'reducir estrés'],
        lifestyleFactors: ['trabajo', 'ejercicio', 'social'],
      };

      // Usar el nuevo sistema de IA
      const analysis = await analyzeMoodWithAI(
        {
          mood: moodData.mood || 3,
          energy: moodData.energy || 5,
          stress: moodData.stress || 5,
          sleep: moodData.sleep || 5,
          notes: moodData.notes || '',
          activities: moodData.activities || [],
          emotions: moodData.emotions || [],
        },
        contextualData
      );

      // Convertir a formato compatible con el tipo AIAnalysis
      return {
        primaryEmotion: analysis.primaryEmotion,
        confidence: analysis.confidence,
        sentiment: analysis.sentiment,
        suggestions: analysis.suggestions.slice(0, 3),
        patterns: analysis.patterns.slice(0, 2),
        // Agregar campos adicionales si están disponibles
        ...(analysis.riskLevel && { riskLevel: analysis.riskLevel }),
        ...(analysis.emotionalState && { emotionalState: analysis.emotionalState }),
        ...(analysis.recommendations && { recommendations: analysis.recommendations.slice(0, 3) }),
      };
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      // Fallback al análisis simple
      return analyzeMoodSimple(moodData);
    } finally {
      setLoading(false);
    }
  };

  // Análisis simple como fallback
  const analyzeMoodSimple = (moodData: Partial<MoodLog>): AIAnalysis => {
    const emotions = ['feliz', 'triste', 'ansioso', 'tranquilo', 'emocionado', 'preocupado', 'motivado', 'agotado'];
    const sentiments = ['positive', 'negative', 'neutral'] as const;

    // Lógica mejorada de análisis
    let primaryEmotion = 'neutral';
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 60;

    // Análisis más sofisticado
    if (moodData.mood && moodData.mood >= 4) {
      primaryEmotion = moodData.energy && moodData.energy >= 7 ? 'emocionado' : 'feliz';
      sentiment = 'positive';
      confidence = 85;
    } else if (moodData.mood && moodData.mood <= 2) {
      primaryEmotion = moodData.stress && moodData.stress >= 7 ? 'preocupado' : 'triste';
      sentiment = 'negative';
      confidence = 80;
    } else if (moodData.stress && moodData.stress >= 7) {
      primaryEmotion = 'ansioso';
      sentiment = 'negative';
      confidence = 75;
    } else if (moodData.energy && moodData.energy <= 3) {
      primaryEmotion = 'agotado';
      sentiment = 'negative';
      confidence = 70;
    } else if (moodData.energy && moodData.energy >= 8) {
      primaryEmotion = 'motivado';
      sentiment = 'positive';
      confidence = 75;
    }

    // Sugerencias más diversas y contextuales
    const suggestions = [
      'Considera hacer ejercicio ligero para mejorar tu estado de ánimo',
      'Practica técnicas de respiración profunda para reducir el estrés',
      'Conecta con amigos o familia para apoyo social',
      'Dedica tiempo a actividades que disfrutes',
      'Mantén una rutina de sueño consistente',
      'Prueba técnicas de mindfulness o meditación',
      'Escucha música que te inspire y relaje',
      'Sal a caminar al aire libre si es posible',
      'Escribe en un diario para procesar tus emociones',
      'Practica gratitud diariamente',
    ];

    // Patrones más diversos
    const patterns = [
      'Tu estado de ánimo muestra variaciones naturales a lo largo del día',
      'El ejercicio regular parece mejorar tu bienestar general',
      'Las conexiones sociales son importantes para tu equilibrio emocional',
      'Los patrones de sueño afectan significativamente tu estado de ánimo',
      'El estrés laboral impacta tu bienestar emocional',
      'Las actividades creativas elevan tu estado de ánimo',
      'La naturaleza tiene un efecto positivo en tu bienestar',
    ];

    // Seleccionar sugerencias y patrones de forma más inteligente
    const selectedSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

    const selectedPatterns = patterns.sort(() => 0.5 - Math.random()).slice(0, 2);

    return {
      primaryEmotion,
      confidence,
      sentiment,
      suggestions: selectedSuggestions,
      patterns: selectedPatterns,
    };
  };

  const saveMoodLog = async (moodData: Partial<MoodLog>) => {
    setLoading(true);
    setError(null);

    try {
      // Usar el análisis de IA mejorado
      const aiAnalysis = await analyzeMoodWithAIEnhanced(moodData);

      const newMoodLog: MoodLog = {
        id: Date.now().toString(),
        userId: userId || 'current-user',
        mood: moodData.mood || 3,
        energy: moodData.energy || 5,
        stress: moodData.stress || 5,
        sleep: moodData.sleep || 5,
        notes: moodData.notes || '',
        activities: moodData.activities || [],
        emotions: moodData.emotions || [],
        aiAnalysis,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMoodLogs((prev) => [newMoodLog, ...prev]);
      return newMoodLog;
    } catch (err) {
      setError('Error al guardar el registro de estado de ánimo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMoodStatistics = () => {
    if (moodLogs.length === 0) {
      return {
        averageMood: 0,
        totalLogs: 0,
        weeklyTrend: 'stable' as const,
        lastMood: null,
        patterns: {
          commonActivities: [],
          commonEmotions: [],
          moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          energyTrend: 'stable',
          stressTrend: 'stable',
        },
      };
    }

    const averageMood = moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodLogs.length;
    const lastWeek = moodLogs.filter((log) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return log.createdAt >= weekAgo;
    });

    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (lastWeek.length >= 2) {
      const firstHalf = lastWeek.slice(0, Math.floor(lastWeek.length / 2));
      const secondHalf = lastWeek.slice(Math.floor(lastWeek.length / 2));

      const firstAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) weeklyTrend = 'improving';
      else if (secondAvg < firstAvg - 0.5) weeklyTrend = 'declining';
    }

    // Análisis de patrones más detallado
    const allActivities = moodLogs.flatMap((log) => log.activities);
    const allEmotions = moodLogs.flatMap((log) => log.emotions);

    const activityCounts = allActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    const commonEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => emotion);

    // Distribución de estados de ánimo
    const moodDistribution = moodLogs.reduce(
      (acc, log) => {
        acc[log.mood as keyof typeof acc] = (acc[log.mood as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    // Tendencias de energía y estrés
    const energyTrend =
      lastWeek.length >= 2
        ? lastWeek[0].energy > lastWeek[lastWeek.length - 1].energy
          ? 'improving'
          : lastWeek[0].energy < lastWeek[lastWeek.length - 1].energy
          ? 'declining'
          : 'stable'
        : 'stable';

    const stressTrend =
      lastWeek.length >= 2
        ? lastWeek[0].stress < lastWeek[lastWeek.length - 1].stress
          ? 'improving'
          : lastWeek[0].stress > lastWeek[lastWeek.length - 1].stress
          ? 'declining'
          : 'stable'
        : 'stable';

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalLogs: moodLogs.length,
      weeklyTrend,
      lastMood: moodLogs[0] || null,
      patterns: {
        commonActivities,
        commonEmotions,
        moodDistribution,
        energyTrend,
        stressTrend,
      },
    };
  };

  return {
    moodLogs,
    loading,
    error,
    insights,
    longTermTrends,
    saveMoodLog,
    getMoodStatistics,
    analyzeMoodWithAI: analyzeMoodWithAIEnhanced,
    generateInsights: () => generateInsights(moodLogs),
  };
};
