import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { moodAnalyzerAgent } from '../services/specializedAgents';
import { getRealMoodData } from '../services/realDataService';
import {
  createMoodLogWithAI,
  deleteMoodLog,
  getMoodLogsByUser,
  getMoodStatistics,
  subscribeToMoodLogs,
  updateMoodLog,
} from '../services/moodLogService';
import { MoodLog } from '../types';

interface MoodAnalysis {
  summary: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  nextSteps: string[];
  moodTrend: 'improving' | 'stable' | 'declining';
  keyFactors: string[];
}

export const useMood = () => {
  const { user } = useAuth();
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MoodAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load mood logs
  const loadMoodLogs = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const logs = await getMoodLogsByUser(user.uid);
      setMoodLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading mood logs');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const stats = await getMoodStatistics(user.uid);
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [user?.uid]);

  // Analyze mood with AI
  const analyzeMoodWithAI = useCallback(async (periodDays: number = 7) => {
    if (!user?.uid) return;

    try {
      setAnalyzing(true);
      
      // Obtener datos de los últimos días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const moodData = await getRealMoodData(user.uid, startDate, endDate);
      
      if (moodData.moodLogs.length === 0) {
        setCurrentAnalysis({
          summary: 'No hay suficientes datos para realizar un análisis. Continúa registrando tu estado de ánimo.',
          patterns: [],
          insights: [],
          recommendations: ['Registra tu estado de ánimo diariamente para obtener análisis más precisos'],
          riskLevel: 'low',
          nextSteps: ['Mantén el registro regular de tu bienestar emocional'],
          moodTrend: 'stable',
          keyFactors: []
        });
        return;
      }

      // Analizar con IA
      const analysis = await moodAnalyzerAgent.analyzeMood(moodData);
      setCurrentAnalysis(analysis);
      
    } catch (err) {
      console.error('Error analyzing mood:', err);
      setCurrentAnalysis({
        summary: 'Error al analizar los datos. Por favor, inténtalo de nuevo.',
        patterns: [],
        insights: [],
        recommendations: ['Continúa registrando tu estado de ánimo'],
        riskLevel: 'low',
        nextSteps: ['Mantén el registro regular'],
        moodTrend: 'stable',
        keyFactors: []
      });
    } finally {
      setAnalyzing(false);
    }
  }, [user?.uid]);

  // Create mood log with automatic analysis
  const createMoodLog = useCallback(
    async (moodData: Omit<MoodLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        
        // Crear el registro de estado de ánimo
        const newLog = await createMoodLogWithAI(user.uid, moodData);
        
        // Actualizar la lista local
        setMoodLogs(prev => [newLog, ...prev]);
        
        // Analizar automáticamente después de crear el registro
        setTimeout(() => {
          analyzeMoodWithAI(7); // Analizar últimos 7 días
        }, 1000);
        
        return newLog;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error creating mood log');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, analyzeMoodWithAI]
  );

  // Update mood log
  const updateMoodLogEntry = useCallback(
    async (logId: string, updates: Partial<MoodLog>) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        await updateMoodLog(logId, updates);
        
        // Actualizar la lista local
        setMoodLogs(prev =>
          prev.map(log => (log.id === logId ? { ...log, ...updates } : log))
        );
        
        // Re-analizar después de la actualización
        setTimeout(() => {
          analyzeMoodWithAI(7);
        }, 1000);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating mood log');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, analyzeMoodWithAI]
  );

  // Delete mood log
  const deleteMoodLogEntry = useCallback(
    async (logId: string) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        await deleteMoodLog(logId);
        
        // Actualizar la lista local
        setMoodLogs(prev => prev.filter(log => log.id !== logId));
        
        // Re-analizar después de la eliminación
        setTimeout(() => {
          analyzeMoodWithAI(7);
        }, 1000);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error deleting mood log');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, analyzeMoodWithAI]
  );

  // Get mood streak
  const getMoodStreak = useCallback(() => {
    if (moodLogs.length === 0) return 0;

    const sortedLogs = [...moodLogs].sort((a, b) => {
      const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = sortedLogs[i].createdAt && typeof sortedLogs[i].createdAt.toDate === 'function' 
        ? sortedLogs[i].createdAt.toDate() 
        : new Date(sortedLogs[i].createdAt);
      
      const logDay = new Date(logDate);
      logDay.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (logDay.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [moodLogs]);

  // Get average mood for a period
  const getAverageMood = useCallback((days: number = 7) => {
    if (moodLogs.length === 0) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = moodLogs.filter(log => {
      const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate() 
        : new Date(log.createdAt);
      return logDate >= cutoffDate;
    });

    if (recentLogs.length === 0) return 0;

    const totalMood = recentLogs.reduce((sum, log) => sum + (log.mood || 0), 0);
    return Math.round((totalMood / recentLogs.length) * 10) / 10;
  }, [moodLogs]);

  // Get mood trend
  const getMoodTrend = useCallback(() => {
    if (moodLogs.length < 2) return 'stable';

    const sortedLogs = [...moodLogs].sort((a, b) => {
      const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    const recent = sortedLogs.slice(-7); // Últimos 7 registros
    if (recent.length < 2) return 'stable';

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg = firstHalf.reduce((sum, log) => sum + (log.mood || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, log) => sum + (log.mood || 0), 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }, [moodLogs]);

  // Load data on mount
  useEffect(() => {
    loadMoodLogs();
    loadStatistics();
  }, [loadMoodLogs, loadStatistics]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToMoodLogs(user.uid, (logs) => {
      setMoodLogs(logs);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Auto-analyze when mood logs change
  useEffect(() => {
    if (moodLogs.length > 0) {
      analyzeMoodWithAI(7);
    }
  }, [moodLogs.length, analyzeMoodWithAI]);

  return {
    moodLogs,
    loading,
    error,
    statistics,
    currentAnalysis,
    analyzing,
    createMoodLog,
    updateMoodLog: updateMoodLogEntry,
    deleteMoodLog: deleteMoodLogEntry,
    loadMoodLogs,
    loadStatistics,
    analyzeMoodWithAI,
    getMoodStreak,
    getAverageMood,
    getMoodTrend,
  };
};
