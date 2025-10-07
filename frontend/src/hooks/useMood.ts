import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createMoodLogWithAI,
  deleteMoodLog,
  getMoodLogsByUser,
  getMoodStatistics,
  subscribeToMoodLogs,
  updateMoodLog,
} from '../services/moodLogService';
import { MoodLog } from '../types';

export const useMood = () => {
  const { user } = useAuth();
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

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

  // Create mood log
  const createMoodLog = useCallback(
    async (moodData: Omit<MoodLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        setLoading(true);
        setError(null);
        const moodLogId = await createMoodLogWithAI({
          ...moodData,
          userId: user.uid,
        });
        await loadMoodLogs();
        await loadStatistics();
        return moodLogId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error creating mood log';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, loadMoodLogs, loadStatistics]
  );

  // Update mood log
  const updateMoodLogEntry = useCallback(
    async (moodLogId: string, updates: Partial<MoodLog>) => {
      try {
        setLoading(true);
        setError(null);
        await updateMoodLog(moodLogId, updates);
        await loadMoodLogs();
        await loadStatistics();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error updating mood log';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loadMoodLogs, loadStatistics]
  );

  // Delete mood log
  const deleteMoodLogEntry = useCallback(
    async (moodLogId: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteMoodLog(moodLogId);
        await loadMoodLogs();
        await loadStatistics();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error deleting mood log';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loadMoodLogs, loadStatistics]
  );

  // Get today's mood log
  const getTodaysMoodLog = useCallback(() => {
    if (!moodLogs.length) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return moodLogs.find((log) => {
      const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate() 
        : new Date();
      return logDate >= today && logDate < tomorrow;
    });
  }, [moodLogs]);

  // Get mood trend
  const getMoodTrend = useCallback(() => {
    if (moodLogs.length < 2) return 'stable';

    const recent = moodLogs.slice(0, 7); // Last 7 days
    const older = moodLogs.slice(7, 14); // Previous 7 days

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, log) => sum + log.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, log) => sum + log.mood, 0) / older.length;

    const difference = recentAvg - olderAvg;
    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'declining';
    return 'stable';
  }, [moodLogs]);

  // Get average mood for period
  const getAverageMood = useCallback(
    (days: number = 7) => {
      const recent = moodLogs.slice(0, days);
      if (recent.length === 0) return 0;

      return recent.reduce((sum, log) => sum + log.mood, 0) / recent.length;
    },
    [moodLogs]
  );

  // Get mood streak
  const getMoodStreak = useCallback(() => {
    console.log('🔍 Calculando racha de días consecutivos...');
    console.log('📊 Total de registros:', moodLogs.length);
    
    if (moodLogs.length === 0) {
      console.log('❌ No hay registros, racha = 0');
      return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('📅 Fecha de hoy:', today.toDateString());

    // Ordenar logs por fecha (más reciente primero)
    const sortedLogs = [...moodLogs].sort((a, b) => {
      const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' 
        ? a.createdAt.toDate() 
        : new Date(a.createdAt);
      const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' 
        ? b.createdAt.toDate() 
        : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    console.log('📋 Registros ordenados por fecha:');
    sortedLogs.forEach((log, index) => {
      const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate() 
        : new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);
      console.log(`  ${index + 1}. ${logDate.toDateString()} - Estado: ${log.mood}`);
    });

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = sortedLogs[i].createdAt && typeof sortedLogs[i].createdAt.toDate === 'function' 
        ? sortedLogs[i].createdAt.toDate() 
        : new Date(sortedLogs[i].createdAt);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      console.log(`🔍 Día ${i + 1}: Esperado ${expectedDate.toDateString()}, Encontrado ${logDate.toDateString()}`);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
        console.log(`✅ Día consecutivo encontrado! Racha actual: ${streak}`);
      } else {
        console.log(`❌ Día no consecutivo. Racha final: ${streak}`);
        break;
      }
    }

    console.log(`🎯 Racha final calculada: ${streak} días`);
    return streak;
  }, [moodLogs]);

  // Setup real-time subscription
  useEffect(() => {
    let isMounted = true;

    if (!user?.uid) {
      if (isMounted) {
        setMoodLogs([]);
        setStatistics(null);
      }
      return;
    }

    const initializeData = async () => {
      try {
        await loadMoodLogs();
        await loadStatistics();
      } catch (error) {
        console.error('Error initializing mood data:', error);
      }
    };

    initializeData();

    const unsubscribe = subscribeToMoodLogs(user.uid, (logs) => {
      if (isMounted) {
        setMoodLogs(logs);
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.uid, loadMoodLogs, loadStatistics]);

  return {
    moodLogs,
    loading,
    error,
    statistics,
    createMoodLog,
    updateMoodLog: updateMoodLogEntry,
    deleteMoodLog: deleteMoodLogEntry,
    getTodaysMoodLog,
    getMoodTrend,
    getAverageMood,
    getMoodStreak,
    refreshMoodLogs: loadMoodLogs,
    refreshStatistics: loadStatistics,
  };
};
