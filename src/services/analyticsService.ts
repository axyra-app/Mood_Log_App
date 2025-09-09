import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { EmotionalPattern, MoodLog, MoodTrend, WellnessInsights } from '../types';
import { db } from './firebase';

// Analytics Functions
export const calculateMoodTrend = async (
  userId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly'
): Promise<MoodTrend> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const now = new Date();
    let startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const moodLogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];

    // Process data for trend analysis
    const data = moodLogs.map((log) => ({
      date: log.createdAt.toDate().toISOString().split('T')[0],
      mood: log.mood,
      energy: log.energy || 0,
      stress: log.stress || 0,
      sleep: log.sleep || 0,
      activities: log.activities || [],
      emotions: log.emotions || [],
    }));

    const averageMood = data.length > 0 ? data.reduce((sum, item) => sum + item.mood, 0) / data.length : 0;

    // Calculate trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (data.length >= 2) {
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.mood, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.mood, 0) / secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;
      if (difference > 0.2) trend = 'improving';
      else if (difference < -0.2) trend = 'declining';
    }

    // Calculate volatility (standard deviation)
    const variance =
      data.length > 0 ? data.reduce((sum, item) => sum + Math.pow(item.mood - averageMood, 2), 0) / data.length : 0;
    const volatility = Math.sqrt(variance) / 5; // Normalize to 0-1 scale

    return {
      period,
      data,
      averageMood,
      trend,
      volatility,
    };
  } catch (error) {
    console.error('Error calculating mood trend:', error);
    throw error;
  }
};

export const analyzeEmotionalPatterns = async (userId: string): Promise<EmotionalPattern[]> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const moodLogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];

    // Analyze emotional patterns
    const emotionStats: Record<
      string,
      { count: number; totalIntensity: number; times: string[]; days: string[]; activities: string[] }
    > = {};

    moodLogs.forEach((log) => {
      const date = log.createdAt.toDate();
      const timeOfDay = date.getHours() < 12 ? 'morning' : date.getHours() < 18 ? 'afternoon' : 'evening';
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      log.emotions.forEach((emotion) => {
        if (!emotionStats[emotion]) {
          emotionStats[emotion] = {
            count: 0,
            totalIntensity: 0,
            times: [],
            days: [],
            activities: [],
          };
        }

        emotionStats[emotion].count++;
        emotionStats[emotion].totalIntensity += log.mood;
        emotionStats[emotion].times.push(timeOfDay);
        emotionStats[emotion].days.push(dayOfWeek);
        emotionStats[emotion].activities.push(...log.activities);
      });
    });

    // Convert to EmotionalPattern objects
    const patterns: EmotionalPattern[] = Object.entries(emotionStats).map(([emotion, stats]) => {
      const frequency = stats.count / moodLogs.length;
      const intensity = stats.totalIntensity / stats.count;

      // Find most common triggers
      const activityCounts: Record<string, number> = {};
      stats.activities.forEach((activity) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });

      const triggers = Object.entries(activityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([activity]) => activity);

      // Find most common times
      const timeCounts: Record<string, number> = {};
      stats.times.forEach((time) => {
        timeCounts[time] = (timeCounts[time] || 0) + 1;
      });

      const commonTimes = Object.entries(timeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([time]) => time);

      // Find most common days
      const dayCounts: Record<string, number> = {};
      stats.days.forEach((day) => {
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const commonDays = Object.entries(dayCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([day]) => day);

      // Calculate correlations with activities
      const correlations = Object.entries(activityCounts)
        .map(([activity, count]) => ({
          activity,
          strength: count / stats.count - 1 / Object.keys(activityCounts).length,
        }))
        .sort((a, b) => b.strength - a.strength);

      return {
        emotion,
        frequency,
        intensity,
        triggers,
        timeOfDay: commonTimes,
        dayOfWeek: commonDays,
        correlation: correlations,
      };
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  } catch (error) {
    console.error('Error analyzing emotional patterns:', error);
    throw error;
  }
};

export const generateWellnessInsights = async (userId: string): Promise<WellnessInsights> => {
  try {
    const [moodTrend, emotionalPatterns] = await Promise.all([
      calculateMoodTrend(userId, 'weekly'),
      analyzeEmotionalPatterns(userId),
    ]);

    // Calculate overall wellness score
    const moodScore = (moodTrend.averageMood / 5) * 40; // 40% weight
    const trendScore = moodTrend.trend === 'improving' ? 30 : moodTrend.trend === 'stable' ? 20 : 10; // 30% weight
    const stabilityScore = (1 - moodTrend.volatility) * 30; // 30% weight
    const overallScore = Math.round(moodScore + trendScore + stabilityScore);

    // Identify strengths and areas for improvement
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    if (moodTrend.averageMood >= 4) {
      strengths.push('Estado de ánimo positivo consistente');
    } else if (moodTrend.averageMood <= 2) {
      areasForImprovement.push('Mejorar el estado de ánimo general');
    }

    if (moodTrend.trend === 'improving') {
      strengths.push('Progreso emocional positivo');
    } else if (moodTrend.trend === 'declining') {
      areasForImprovement.push('Reversar la tendencia negativa');
    }

    if (moodTrend.volatility < 0.3) {
      strengths.push('Estabilidad emocional');
    } else {
      areasForImprovement.push('Reducir la variabilidad emocional');
    }

    // Generate recommendations based on patterns
    const recommendations: string[] = [];

    emotionalPatterns.forEach((pattern) => {
      if (pattern.frequency > 0.3 && pattern.intensity < 3) {
        recommendations.push(`Considera actividades que te ayuden a manejar mejor la emoción de ${pattern.emotion}`);
      }

      if (pattern.triggers.length > 0) {
        recommendations.push(
          `Evita o modifica las actividades que desencadenan ${pattern.emotion}: ${pattern.triggers
            .slice(0, 3)
            .join(', ')}`
        );
      }
    });

    // Identify risk and protective factors
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];

    if (moodTrend.averageMood <= 2) {
      riskFactors.push('Estado de ánimo persistentemente bajo');
    }

    if (moodTrend.volatility > 0.5) {
      riskFactors.push('Alta variabilidad emocional');
    }

    if (moodTrend.trend === 'improving') {
      protectiveFactors.push('Tendencia de mejora emocional');
    }

    if (emotionalPatterns.some((p) => p.emotion === 'gratitude' || p.emotion === 'joy')) {
      protectiveFactors.push('Presencia de emociones positivas');
    }

    // Generate goals
    const shortTermGoals: string[] = [];
    const longTermGoals: string[] = [];

    if (moodTrend.averageMood < 3) {
      shortTermGoals.push('Aumentar el estado de ánimo promedio a 3 o más');
    }

    if (moodTrend.volatility > 0.4) {
      shortTermGoals.push('Reducir la variabilidad emocional');
    }

    longTermGoals.push('Mantener un estado de ánimo estable y positivo');
    longTermGoals.push('Desarrollar estrategias de afrontamiento saludables');

    return {
      overallScore,
      strengths,
      areasForImprovement,
      recommendations,
      riskFactors,
      protectiveFactors,
      patterns: emotionalPatterns,
      trends: [moodTrend],
      goals: {
        shortTerm: shortTermGoals,
        longTerm: longTermGoals,
      },
    };
  } catch (error) {
    console.error('Error generating wellness insights:', error);
    throw error;
  }
};

export const getMoodStatistics = async (userId: string, days: number = 30) => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const moodLogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];

    if (moodLogs.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        moodDistribution: {},
        weeklyAverages: [],
        mostCommonEmotions: [],
        mostCommonActivities: [],
        moodByDayOfWeek: {},
        moodByTimeOfDay: {},
      };
    }

    // Calculate basic statistics
    const totalEntries = moodLogs.length;
    const averageMood = moodLogs.reduce((sum, log) => sum + log.mood, 0) / totalEntries;

    // Mood distribution
    const moodDistribution: Record<number, number> = {};
    moodLogs.forEach((log) => {
      moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
    });

    // Weekly averages
    const weeklyAverages: { week: string; averageMood: number }[] = [];
    const weeks = new Map<string, number[]>();

    moodLogs.forEach((log) => {
      const date = log.createdAt.toDate();
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
      const dayOfWeek = log.createdAt.toDate().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
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
      const hour = log.createdAt.toDate().getHours();
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

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 100) / 100,
      moodDistribution,
      weeklyAverages,
      mostCommonEmotions,
      mostCommonActivities,
      moodByDayOfWeek: moodByDayOfWeekAvg,
      moodByTimeOfDay: moodByTimeOfDayAvg,
    };
  } catch (error) {
    console.error('Error getting mood statistics:', error);
    throw error;
  }
};

// Save analytics data for caching
export const saveAnalyticsCache = async (userId: string, insights: WellnessInsights): Promise<void> => {
  try {
    const cacheRef = doc(db, 'analyticsCache', userId);
    await updateDoc(cacheRef, {
      insights,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving analytics cache:', error);
    throw error;
  }
};

export const getAnalyticsCache = async (userId: string): Promise<WellnessInsights | null> => {
  try {
    const cacheRef = doc(db, 'analyticsCache', userId);
    const cacheSnap = await getDoc(cacheRef);

    if (cacheSnap.exists()) {
      const data = cacheSnap.data();
      const lastUpdated = data.lastUpdated.toDate();
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Return cached data if it's less than a day old
      if (lastUpdated > oneDayAgo) {
        return data.insights as WellnessInsights;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting analytics cache:', error);
    throw error;
  }
};
