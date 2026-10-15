import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createMoodLog as saveMoodLog,
  deleteMoodLog,
  getMoodLogsByUser,
  getMoodStatistics,
  subscribeToMoodLogs,
  updateMoodLog,
} from '../services/moodLogService';
import { MoodLog } from '../types';
import {
  getAverageMoodForDays,
  getMoodStreak as calculateMoodStreak,
  getMoodTrend as calculateMoodTrend,
  toDate,
} from '../utils/moodMetrics';

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
    async (moodData: Omit<MoodLog, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'aiAnalysis'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      // Prevent duplicate submissions
      if (loading) {
        console.warn('⚠️ Mood log creation already in progress, ignoring duplicate request');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const moodLogId = await saveMoodLog({
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
    [user?.uid, loadMoodLogs, loadStatistics, loading]
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

    return moodLogs.find((log) => {
      const logDate = toDate(log.createdAt);
      return logDate?.toDateString() === new Date().toDateString();
    });
  }, [moodLogs]);

  const getMoodTrend = useCallback(() => calculateMoodTrend(moodLogs), [moodLogs]);

  const getAverageMood = useCallback(
    (days: number = 7) => getAverageMoodForDays(moodLogs, days) ?? 0,
    [moodLogs],
  );

  const getMoodStreak = useCallback(() => calculateMoodStreak(moodLogs), [moodLogs]);

  // Setup real-time subscription
  useEffect(() => {
    let isMounted = true;

    if (!user?.uid) {
      if (isMounted) {
        setMoodLogs([]);
        setStatistics(null);
        setError(null);
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

    const unsubscribe = subscribeToMoodLogs(
      user.uid,
      (logs) => {
        if (isMounted) {
          setMoodLogs(logs);
          setError(null);
        }
      },
      (subscriptionError) => {
        if (isMounted) setError(subscriptionError.message);
      },
    );

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
