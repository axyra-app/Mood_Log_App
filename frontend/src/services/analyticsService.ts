import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { logSanitizedClientError } from '../utils/safeClientLog';

export interface ReportData {
  id?: string;
  userId?: string;
  type: 'mood_trends' | 'wellness_overview';
  title: string;
  description: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface AnalyticsData {
  moodTrends: {
    period: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
    dataPoints: number;
  }[];
  activityPatterns: {
    activity: string;
    frequency: number;
    averageMood: number | null;
    sampleCount: number;
  }[];
  emotionalPatterns: {
    emotion: string;
    frequency: number;
    averageMood: number | null;
    sampleCount: number;
  }[];
  wellnessMetrics: {
    sleep: {
      average: number | null;
      sampleCount: number;
    };
    energy: {
      average: number | null;
      sampleCount: number;
    };
    stress: {
      average: number | null;
      sampleCount: number;
    };
  };
}

class AnalyticsService {
  // Generar reporte de tendencias de mood
  async generateMoodTrendsReport(userId: string, startDate: Date, endDate: Date): Promise<ReportData> {
    try {
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(moodLogsQuery);
      const moodLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      const analytics = this.calculateMoodTrends(moodLogs);
      const insights = this.generateMoodInsights(analytics);
      const recommendations = this.generateMoodRecommendations(analytics);

      const report: ReportData = {
        userId,
        type: 'mood_trends',
        title: 'Reporte de Tendencias de Estado de Ánimo',
        description: `Análisis de tendencias de estado de ánimo del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`,
        period: { start: startDate, end: endDate },
        data: analytics,
        insights,
        recommendations,
        generatedAt: new Date(),
        generatedBy: 'system',
      };

      return report;
    } catch (error) {
      logSanitizedClientError('Mood trends report generation failed', error);
      throw error;
    }
  }

  // Calcular tendencias de mood
  private calculateMoodTrends(moodLogs: any[]): any {
    if (moodLogs.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        change: 0,
        dataPoints: 0,
        weeklyTrends: [],
        dailyPatterns: [],
      };
    }

    const chronologicalLogs = [...moodLogs].sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );
    const totalMood = chronologicalLogs.reduce((sum, log) => sum + log.mood, 0);
    const average = totalMood / moodLogs.length;

    if (chronologicalLogs.length < 2) {
      return {
        average,
        trend: 'stable',
        change: 0,
        dataPoints: chronologicalLogs.length,
        weeklyTrends: this.calculateWeeklyTrends(chronologicalLogs),
        dailyPatterns: this.calculateDailyPatterns(chronologicalLogs),
      };
    }

    // Calcular tendencia general
    const firstHalf = chronologicalLogs.slice(0, Math.floor(chronologicalLogs.length / 2));
    const secondHalf = chronologicalLogs.slice(Math.floor(chronologicalLogs.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;

    const change = secondHalfAvg - firstHalfAvg;
    const trend: 'up' | 'down' | 'stable' = change > 0.2 ? 'up' : change < -0.2 ? 'down' : 'stable';

    return {
      average,
      trend,
      change: Math.abs(change),
      dataPoints: moodLogs.length,
      weeklyTrends: this.calculateWeeklyTrends(moodLogs),
      dailyPatterns: this.calculateDailyPatterns(moodLogs),
    };
  }

  // Calcular tendencias semanales
  private calculateWeeklyTrends(moodLogs: any[]): any[] {
    const weeks: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      const weekStart = new Date(log.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(log.mood);
    });

    return Object.entries(weeks).map(([week, moods]) => ({
      week,
      average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      count: moods.length,
    }));
  }

  // Calcular patrones diarios
  private calculateDailyPatterns(moodLogs: any[]): any[] {
    const days: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      const dayOfWeek = log.createdAt.getDay();
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];

      if (!days[dayName]) {
        days[dayName] = [];
      }
      days[dayName].push(log.mood);
    });

    return Object.entries(days).map(([day, moods]) => ({
      day,
      average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      count: moods.length,
    }));
  }

  // Generar insights de mood
  private generateMoodInsights(analytics: any): string[] {
    const insights: string[] = [];

    if (analytics.dataPoints === 0) {
      return ['Aún no hay autorregistros suficientes para resumir este período.'];
    }

    if (analytics.trend === 'up') {
      insights.push(`El promedio de la segunda parte fue ${analytics.change.toFixed(1)} puntos mayor que en la primera parte. Es una comparación descriptiva de tus registros, no una evaluación clínica ni una explicación de causas.`);
    } else if (analytics.trend === 'down') {
      insights.push(`El promedio de la segunda parte fue ${analytics.change.toFixed(1)} puntos menor que en la primera parte. Es una comparación descriptiva de tus registros, no una evaluación clínica ni una explicación de causas.`);
    } else {
      insights.push('Los promedios de ambas partes fueron similares. Esto describe los registros disponibles y no evalúa tu salud mental.');
    }

    if (analytics.dataPoints < 7) {
      insights.push(`Este resumen se basa en ${analytics.dataPoints} autorregistro${analytics.dataPoints === 1 ? '' : 's'}; puede representar poco contexto del período.`);
    }

    return insights;
  }

  // Generar recomendaciones de mood
  private generateMoodRecommendations(analytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.dataPoints === 0) {
      return recommendations;
    }

    if (analytics.trend === 'down') {
      recommendations.push('Si te sirve, anota qué estaba pasando durante esos registros y qué apoyo o actividades te gustaría explorar.');
    }
    recommendations.push('Puedes revisar este resumen junto con tus propias observaciones; tú decides qué significado tiene para ti.');

    return recommendations;
  }

  // Obtener analytics en tiempo real
  async getRealTimeAnalytics(userId: string): Promise<AnalyticsData> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userId),
        where('createdAt', '>=', thirtyDaysAgo),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(moodLogsQuery);
      const moodLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      return this.calculateAnalyticsData(moodLogs);
    } catch (error) {
      logSanitizedClientError('Realtime mood analytics read failed', error);
      throw error;
    }
  }

  // Calcular datos de analytics
  private calculateAnalyticsData(moodLogs: any[]): AnalyticsData {
    const moodTrends = this.calculateMoodTrends(moodLogs);
    const activityPatterns = this.calculateActivityPatterns(moodLogs);
    const emotionalPatterns = this.calculateEmotionalPatterns(moodLogs);
    const wellnessMetrics = this.calculateWellnessMetrics(moodLogs);

    return {
      moodTrends: [moodTrends],
      activityPatterns,
      emotionalPatterns,
      wellnessMetrics,
    };
  }

  // Calcular patrones de actividad
  private calculateActivityPatterns(moodLogs: any[]): any[] {
    const activityCount: { [key: string]: number } = {};
    const activityMoodObservations: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      log.activities?.forEach((activity: string) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
        if (!activityMoodObservations[activity]) {
          activityMoodObservations[activity] = [];
        }
        if (Number.isFinite(log.mood)) activityMoodObservations[activity].push(log.mood);
      });
    });

    return Object.entries(activityCount).map(([activity, frequency]) => {
      const moods = activityMoodObservations[activity];
      const averageMood = moods.length > 0
        ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length
        : null;

      return {
        activity,
        frequency,
        averageMood,
        sampleCount: moods.length,
      };
    });
  }

  // Calcular patrones emocionales
  private calculateEmotionalPatterns(moodLogs: any[]): any[] {
    const emotionCount: { [key: string]: number } = {};
    const emotionIntensity: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      log.emotions?.forEach((emotion: string) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        if (!emotionIntensity[emotion]) {
          emotionIntensity[emotion] = [];
        }
        emotionIntensity[emotion].push(log.mood);
      });
    });

    return Object.entries(emotionCount).map(([emotion, frequency]) => {
      const intensities = emotionIntensity[emotion];
      const averageMood = intensities.length > 0
        ? intensities.reduce((sum, mood) => sum + mood, 0) / intensities.length
        : null;

      return {
        emotion,
        frequency,
        averageMood,
        sampleCount: intensities.length,
      };
    });
  }

  // Calcular métricas de bienestar
  private calculateWellnessMetrics(moodLogs: any[]): any {
    const getSummary = (key: 'sleep' | 'energy' | 'stress') => {
      const values = moodLogs
        .map((log) => log[key])
        .filter((value): value is number => Number.isFinite(value));
      return {
        average: values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : null,
        sampleCount: values.length,
      };
    };

    return {
      sleep: getSummary('sleep'),
      energy: getSummary('energy'),
      stress: getSummary('stress'),
    };
  }
}

export const analyticsService = new AnalyticsService();
