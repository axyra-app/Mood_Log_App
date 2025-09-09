import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { useFirestoreOptimization } from './usePerformance';

export interface MoodLog {
  id: string;
  userId: string;
  mood: number;
  energy?: number;
  stress?: number;
  sleep?: number;
  notes?: string;
  activities?: string[];
  emotions?: string[];
  createdAt: any;
  updatedAt?: any;
}

export interface MoodStatistics {
  totalEntries: number;
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  moodDistribution: Record<number, number>;
  weeklyTrend: number[];
  monthlyTrend: number[];
  bestDay: string;
  worstDay: string;
  streak: number;
  lastEntry: Date | null;
}

export const useOptimizedMood = () => {
  const { user } = useAuth();
  const { getCachedQuery, setCachedQuery, clearCache } = useFirestoreOptimization();

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [statistics, setStatistics] = useState<MoodStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Memoizar la consulta de mood logs
  const moodLogsQuery = useMemo(() => {
    if (!user?.uid) return null;
    return query(collection(db, 'moodLogs'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(100));
  }, [user?.uid]);

  // Cargar mood logs con caché
  const loadMoodLogs = useCallback(
    async (forceRefresh = false) => {
      if (!user?.uid || !moodLogsQuery) return;

      const cacheKey = `moodLogs_${user.uid}`;

      // Verificar caché si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = getCachedQuery(cacheKey);
        if (cachedData) {
          setMoodLogs(cachedData);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(moodLogsQuery);
        const logs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MoodLog[];

        setMoodLogs(logs);
        setCachedQuery(cacheKey, logs);
        setLastFetch(new Date());
      } catch (err) {
        console.error('Error loading mood logs:', err);
        setError('Error al cargar los registros de estado de ánimo');
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, moodLogsQuery, getCachedQuery, setCachedQuery]
  );

  // Calcular estadísticas de forma memoizada
  const calculateStatistics = useCallback((logs: MoodLog[]): MoodStatistics => {
    if (logs.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        weeklyTrend: [],
        monthlyTrend: [],
        bestDay: '',
        worstDay: '',
        streak: 0,
        lastEntry: null,
      };
    }

    // Calcular promedios
    const totalEntries = logs.length;
    const averageMood = logs.reduce((sum, log) => sum + log.mood, 0) / totalEntries;
    const averageEnergy = logs.reduce((sum, log) => sum + (log.energy || 0), 0) / totalEntries;
    const averageStress = logs.reduce((sum, log) => sum + (log.stress || 0), 0) / totalEntries;

    // Distribución de mood
    const moodDistribution = logs.reduce((dist, log) => {
      dist[log.mood] = (dist[log.mood] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    // Tendencias semanales y mensuales
    const weeklyTrend = calculateWeeklyTrend(logs);
    const monthlyTrend = calculateMonthlyTrend(logs);

    // Mejor y peor día
    const bestDay = getBestDay(logs);
    const worstDay = getWorstDay(logs);

    // Racha actual
    const streak = calculateStreak(logs);

    // Última entrada
    const lastEntry = logs[0]?.createdAt ? new Date(logs[0].createdAt.seconds * 1000) : null;

    return {
      totalEntries,
      averageMood,
      averageEnergy,
      averageStress,
      moodDistribution,
      weeklyTrend,
      monthlyTrend,
      bestDay,
      worstDay,
      streak,
      lastEntry,
    };
  }, []);

  // Actualizar estadísticas cuando cambien los mood logs
  useEffect(() => {
    if (moodLogs.length > 0) {
      const stats = calculateStatistics(moodLogs);
      setStatistics(stats);
    }
  }, [moodLogs, calculateStatistics]);

  // Crear nuevo mood log
  const createMoodLog = useCallback(
    async (moodData: Omit<MoodLog, 'id' | 'userId' | 'createdAt'>) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        const moodLogData = {
          ...moodData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'moodLogs'), moodLogData);

        // Actualizar lista local
        const newMoodLog: MoodLog = {
          id: docRef.id,
          ...moodLogData,
          createdAt: new Date(), // Fallback para actualización local
        };

        setMoodLogs((prev) => [newMoodLog, ...prev]);

        // Limpiar caché para forzar recarga
        clearCache();

        return docRef.id;
      } catch (err) {
        console.error('Error creating mood log:', err);
        setError('Error al crear el registro de estado de ánimo');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, clearCache]
  );

  // Refrescar datos
  const refreshMoodLogs = useCallback(() => {
    loadMoodLogs(true);
  }, [loadMoodLogs]);

  // Refrescar estadísticas
  const refreshStatistics = useCallback(() => {
    if (moodLogs.length > 0) {
      const stats = calculateStatistics(moodLogs);
      setStatistics(stats);
    }
  }, [moodLogs, calculateStatistics]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.uid) {
      loadMoodLogs();
    }
  }, [user?.uid, loadMoodLogs]);

  // Limpiar datos al desmontar
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    moodLogs,
    statistics,
    loading,
    error,
    lastFetch,
    loadMoodLogs,
    createMoodLog,
    refreshMoodLogs,
    refreshStatistics,
  };
};

// Funciones auxiliares para cálculos
const calculateWeeklyTrend = (logs: MoodLog[]): number[] => {
  const weeklyData: number[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.createdAt.seconds * 1000);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    });

    const avgMood = dayLogs.length > 0 ? dayLogs.reduce((sum, log) => sum + log.mood, 0) / dayLogs.length : 0;

    weeklyData.push(avgMood);
  }

  return weeklyData;
};

const calculateMonthlyTrend = (logs: MoodLog[]): number[] => {
  const monthlyData: number[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.createdAt.seconds * 1000);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    });

    const avgMood = dayLogs.length > 0 ? dayLogs.reduce((sum, log) => sum + log.mood, 0) / dayLogs.length : 0;

    monthlyData.push(avgMood);
  }

  return monthlyData;
};

const getBestDay = (logs: MoodLog[]): string => {
  if (logs.length === 0) return '';

  const dayAverages: Record<string, { sum: number; count: number }> = {};

  logs.forEach((log) => {
    const date = new Date(log.createdAt.seconds * 1000);
    const dayKey = date.toLocaleDateString('es-ES', { weekday: 'long' });

    if (!dayAverages[dayKey]) {
      dayAverages[dayKey] = { sum: 0, count: 0 };
    }

    dayAverages[dayKey].sum += log.mood;
    dayAverages[dayKey].count += 1;
  });

  let bestDay = '';
  let bestAverage = 0;

  Object.entries(dayAverages).forEach(([day, data]) => {
    const average = data.sum / data.count;
    if (average > bestAverage) {
      bestAverage = average;
      bestDay = day;
    }
  });

  return bestDay;
};

const getWorstDay = (logs: MoodLog[]): string => {
  if (logs.length === 0) return '';

  const dayAverages: Record<string, { sum: number; count: number }> = {};

  logs.forEach((log) => {
    const date = new Date(log.createdAt.seconds * 1000);
    const dayKey = date.toLocaleDateString('es-ES', { weekday: 'long' });

    if (!dayAverages[dayKey]) {
      dayAverages[dayKey] = { sum: 0, count: 0 };
    }

    dayAverages[dayKey].sum += log.mood;
    dayAverages[dayKey].count += 1;
  });

  let worstDay = '';
  let worstAverage = 5;

  Object.entries(dayAverages).forEach(([day, data]) => {
    const average = data.sum / data.count;
    if (average < worstAverage) {
      worstAverage = average;
      worstDay = day;
    }
  });

  return worstDay;
};

const calculateStreak = (logs: MoodLog[]): number => {
  if (logs.length === 0) return 0;

  let streak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    // Máximo 365 días
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);

    const hasEntry = logs.some((log) => {
      const logDate = new Date(log.createdAt.seconds * 1000);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === checkDate.getTime();
    });

    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
