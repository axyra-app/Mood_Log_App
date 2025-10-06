import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { MoodLog } from '../types';
import { db } from './firebase';

// Mood Log Management Functions
export const createMoodLog = async (moodData: Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const docRef = await addDoc(moodLogsRef, {
      ...moodData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating mood log:', error);
    throw error;
  }
};

export const getMoodLog = async (moodLogId: string): Promise<MoodLog | null> => {
  try {
    const moodLogRef = doc(db, 'moodLogs', moodLogId);
    const moodLogSnap = await getDoc(moodLogRef);

    if (moodLogSnap.exists()) {
      return { id: moodLogSnap.id, ...moodLogSnap.data() } as MoodLog;
    }
    return null;
  } catch (error) {
    console.error('Error getting mood log:', error);
    throw error;
  }
};

export const getMoodLogsByUser = async (userId: string, limitCount: number = 50): Promise<MoodLog[]> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(moodLogsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];
  } catch (error) {
    console.error('Error getting mood logs by user:', error);
    throw error;
  }
};

export const getMoodLogsByDateRange = async (userId: string, startDate: Date, endDate: Date): Promise<MoodLog[]> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];
  } catch (error) {
    console.error('Error getting mood logs by date range:', error);
    throw error;
  }
};

export const updateMoodLog = async (moodLogId: string, updates: Partial<MoodLog>): Promise<void> => {
  try {
    const moodLogRef = doc(db, 'moodLogs', moodLogId);
    await updateDoc(moodLogRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating mood log:', error);
    throw error;
  }
};

export const deleteMoodLog = async (moodLogId: string): Promise<void> => {
  try {
    const moodLogRef = doc(db, 'moodLogs', moodLogId);
    await deleteDoc(moodLogRef);
  } catch (error) {
    console.error('Error deleting mood log:', error);
    throw error;
  }
};

// AI Analysis Integration
export const createMoodLogWithAI = async (
  moodData: Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis'>
): Promise<string> => {
  try {
    // Simple analysis without AI
    const aiAnalysis = {
      insights: ['Análisis básico disponible'],
      recommendations: ['Continúa registrando tu estado de ánimo'],
      patterns: ['Patrón básico detectado']
    };

    // Create mood log with AI analysis
    const moodLogsRef = collection(db, 'moodLogs');
    const docRef = await addDoc(moodLogsRef, {
      ...moodData,
      aiAnalysis,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating mood log with AI:', error);
    // Fallback: create without AI analysis
    return await createMoodLog(moodData);
  }
};

// Real-time subscriptions
export const subscribeToMoodLogs = (userId: string, callback: (moodLogs: MoodLog[]) => void) => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(moodLogsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50));

    return onSnapshot(q, (querySnapshot) => {
      try {
        const moodLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MoodLog[];
        callback(moodLogs);
      } catch (error) {
        console.error('Error processing mood logs snapshot:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error in mood logs subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up mood logs subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Statistics and Analytics
export const getMoodStatistics = async (userId: string, days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodLogs = await getMoodLogsByDateRange(userId, startDate, new Date());

    if (moodLogs.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        moodDistribution: {},
        weeklyAverages: [],
        mostCommonEmotions: [],
        mostCommonActivities: [],
        moodByDayOfWeek: {},
        moodByTimeOfDay: {},
        aiInsights: [],
      };
    }

    // Calculate basic statistics
    const totalEntries = moodLogs.length;
    const averageMood = moodLogs.reduce((sum, log) => sum + log.mood, 0) / totalEntries;
    const averageEnergy = moodLogs.reduce((sum, log) => sum + (log.energy || 0), 0) / totalEntries;
    const averageStress = moodLogs.reduce((sum, log) => sum + (log.stress || 0), 0) / totalEntries;
    const averageSleep = moodLogs.reduce((sum, log) => sum + (log.sleep || 0), 0) / totalEntries;

    // Mood distribution
    const moodDistribution: Record<number, number> = {};
    moodLogs.forEach((log) => {
      moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
    });

    // Weekly averages
    const weeklyAverages: { week: string; averageMood: number }[] = [];
    const weeks = new Map<string, number[]>();

    moodLogs.forEach((log) => {
      const date = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate() 
        : new Date();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, []);
      }
      weeks.get(weekKey)!.push(log.mood);
    });

    weeks.forEach((moods, week) => {
      weeklyAverages.push({
        week,
        averageMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      });
    });

    // Most common emotions
    const emotionCounts: Record<string, number> = {};
    moodLogs.forEach((log) => {
      log.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const mostCommonEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([emotion, count]) => ({ emotion, count }));

    // Most common activities
    const activityCounts: Record<string, number> = {};
    moodLogs.forEach((log) => {
      log.activities.forEach((activity) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });

    const mostCommonActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([activity, count]) => ({ activity, count }));

    // Mood by day of week
    const moodByDayOfWeek: Record<string, number[]> = {};
    moodLogs.forEach((log) => {
      const dayOfWeek = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        : new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (!moodByDayOfWeek[dayOfWeek]) {
        moodByDayOfWeek[dayOfWeek] = [];
      }
      moodByDayOfWeek[dayOfWeek].push(log.mood);
    });

    // Calculate averages for each day
    const moodByDayOfWeekAvg: Record<string, number> = {};
    Object.entries(moodByDayOfWeek).forEach(([day, moods]) => {
      moodByDayOfWeekAvg[day] = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    });

    // Mood by time of day
    const moodByTimeOfDay: Record<string, number[]> = {};
    moodLogs.forEach((log) => {
      const hour = log.createdAt && typeof log.createdAt.toDate === 'function' 
        ? log.createdAt.toDate().getHours()
        : new Date().getHours();
      let timeOfDay: string;
      if (hour < 6) timeOfDay = 'night';
      else if (hour < 12) timeOfDay = 'morning';
      else if (hour < 18) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';

      if (!moodByTimeOfDay[timeOfDay]) {
        moodByTimeOfDay[timeOfDay] = [];
      }
      moodByTimeOfDay[timeOfDay].push(log.mood);
    });

    // Calculate averages for each time
    const moodByTimeOfDayAvg: Record<string, number> = {};
    Object.entries(moodByTimeOfDay).forEach(([time, moods]) => {
      moodByTimeOfDayAvg[time] = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    });

    // AI Insights
    const aiInsights = moodLogs
      .filter((log) => log.aiAnalysis)
      .map((log) => log.aiAnalysis)
      .slice(0, 5);

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 100) / 100,
      averageEnergy: Math.round(averageEnergy * 100) / 100,
      averageStress: Math.round(averageStress * 100) / 100,
      averageSleep: Math.round(averageSleep * 100) / 100,
      moodDistribution,
      weeklyAverages,
      mostCommonEmotions,
      mostCommonActivities,
      moodByDayOfWeek: moodByDayOfWeekAvg,
      moodByTimeOfDay: moodByTimeOfDayAvg,
      aiInsights,
    };
  } catch (error) {
    console.error('Error getting mood statistics:', error);
    throw error;
  }
};

// Search and filtering
export const searchMoodLogs = async (
  userId: string,
  searchTerm: string,
  startDate?: Date,
  endDate?: Date
): Promise<MoodLog[]> => {
  try {
    let moodLogs: MoodLog[];

    if (startDate && endDate) {
      moodLogs = await getMoodLogsByDateRange(userId, startDate, endDate);
    } else {
      moodLogs = await getMoodLogsByUser(userId);
    }

    // Client-side search filtering
    if (searchTerm) {
      moodLogs = moodLogs.filter(
        (log) =>
          log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.emotions.some((emotion) => emotion.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.activities.some((activity) => activity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return moodLogs;
  } catch (error) {
    console.error('Error searching mood logs:', error);
    throw error;
  }
};

// Export mood data
export const exportMoodData = async (userId: string, format: 'json' | 'csv' = 'json') => {
  try {
    const moodLogs = await getMoodLogsByUser(userId, 1000); // Get more data for export

    if (format === 'json') {
      return JSON.stringify(moodLogs, null, 2);
    } else {
      // CSV format
      const headers = ['Date', 'Mood', 'Energy', 'Stress', 'Sleep', 'Notes', 'Emotions', 'Activities'];
      const csvRows = [headers.join(',')];

      moodLogs.forEach((log) => {
        const row = [
          log.createdAt && typeof log.createdAt.toDate === 'function' 
            ? log.createdAt.toDate().toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          log.mood.toString(),
          (log.energy || 0).toString(),
          (log.stress || 0).toString(),
          (log.sleep || 0).toString(),
          `"${log.notes.replace(/"/g, '""')}"`,
          `"${log.emotions.join('; ')}"`,
          `"${log.activities.join('; ')}"`,
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    }
  } catch (error) {
    console.error('Error exporting mood data:', error);
    throw error;
  }
};
