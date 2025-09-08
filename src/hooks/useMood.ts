import { useEffect, useState } from 'react';
import { getMoodLogsRealtime } from '../services/firestore';
import { AIAnalysis, MoodLog } from '../types';

export const useMood = (userId?: string) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar mood logs en tiempo real si se proporciona userId
  useEffect(() => {
    if (userId) {
      const unsubscribe = getMoodLogsRealtime(userId, (logs) => {
        setMoodLogs(logs);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  // Simular análisis de IA (en producción esto vendría de una API real)
  const analyzeMoodWithAI = async (moodData: Partial<MoodLog>): Promise<AIAnalysis> => {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const emotions = ['feliz', 'triste', 'ansioso', 'tranquilo', 'emocionado', 'preocupado'];
    const sentiments = ['positive', 'negative', 'neutral'] as const;

    // Lógica simple de análisis (en producción sería más compleja)
    let primaryEmotion = 'neutral';
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 60;

    if (moodData.mood && moodData.mood >= 4) {
      primaryEmotion = 'feliz';
      sentiment = 'positive';
      confidence = 85;
    } else if (moodData.mood && moodData.mood <= 2) {
      primaryEmotion = 'triste';
      sentiment = 'negative';
      confidence = 80;
    } else if (moodData.stress && moodData.stress >= 7) {
      primaryEmotion = 'ansioso';
      sentiment = 'negative';
      confidence = 75;
    }

    const suggestions = [
      'Considera hacer ejercicio ligero',
      'Practica técnicas de respiración',
      'Conecta con amigos o familia',
      'Dedica tiempo a tus hobbies favoritos',
    ];

    const patterns = [
      'Tendencia positiva en los últimos días',
      'Mejor estado de ánimo en las mañanas',
      'Estrés elevado los lunes',
    ];

    return {
      primaryEmotion,
      confidence,
      sentiment,
      suggestions: suggestions.slice(0, 2),
      patterns: patterns.slice(0, 1),
    };
  };

  const saveMoodLog = async (moodData: Partial<MoodLog>) => {
    setLoading(true);
    setError(null);

    try {
      // Simular análisis de IA
      const aiAnalysis = await analyzeMoodWithAI(moodData);

      const newMoodLog: MoodLog = {
        id: Date.now().toString(),
        userId: 'current-user', // En producción vendría del contexto de auth
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

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalLogs: moodLogs.length,
      weeklyTrend,
      lastMood: moodLogs[0] || null,
    };
  };

  return {
    moodLogs,
    loading,
    error,
    saveMoodLog,
    getMoodStatistics,
    analyzeMoodWithAI,
  };
};
