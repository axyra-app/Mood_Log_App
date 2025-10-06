import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ReportData {
  id?: string;
  userId?: string;
  psychologistId?: string;
  type: 'mood_trends' | 'patient_progress' | 'crisis_analysis' | 'appointment_summary' | 'wellness_overview';
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
    correlation: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  emotionalPatterns: {
    emotion: string;
    frequency: number;
    intensity: number;
    triggers: string[];
  }[];
  wellnessMetrics: {
    sleep: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      quality: 'poor' | 'fair' | 'good' | 'excellent';
    };
    energy: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      peakHours: string[];
    };
    stress: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      triggers: string[];
    };
  };
  crisisIndicators: {
    totalAlerts: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    trend: 'up' | 'down' | 'stable';
    commonTriggers: string[];
  };
  achievements: {
    total: number;
    recent: any[];
    categories: Record<string, number>;
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
      console.error('Error generating mood trends report:', error);
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

    const totalMood = moodLogs.reduce((sum, log) => sum + log.mood, 0);
    const average = totalMood / moodLogs.length;

    // Calcular tendencia general
    const firstHalf = moodLogs.slice(0, Math.floor(moodLogs.length / 2));
    const secondHalf = moodLogs.slice(Math.floor(moodLogs.length / 2));

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

    if (analytics.trend === 'up') {
      insights.push('Tu estado de ánimo ha mejorado significativamente en el período analizado.');
    } else if (analytics.trend === 'down') {
      insights.push('Se observa una tendencia descendente en tu estado de ánimo que requiere atención.');
    } else {
      insights.push('Tu estado de ánimo se mantiene estable, lo cual es positivo.');
    }

    if (analytics.dataPoints < 7) {
      insights.push(
        'Se recomienda registrar tu estado de ánimo más frecuentemente para obtener análisis más precisos.'
      );
    }

    return insights;
  }

  // Generar recomendaciones de mood
  private generateMoodRecommendations(analytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.trend === 'down') {
      recommendations.push('Considera aumentar las actividades que te generan bienestar.');
      recommendations.push('Es importante mantener contacto regular con tu psicólogo.');
    }

    if (analytics.average < 3) {
      recommendations.push('Se sugiere implementar técnicas de relajación y mindfulness.');
      recommendations.push('Mantén una rutina de sueño regular y ejercicio moderado.');
    }

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
      console.error('Error getting real-time analytics:', error);
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
      crisisIndicators: {
        totalAlerts: 0,
        severity: 'low',
        trend: 'stable',
        commonTriggers: [],
      },
      achievements: {
        total: 0,
        recent: [],
        categories: {},
      },
    };
  }

  // Calcular patrones de actividad
  private calculateActivityPatterns(moodLogs: any[]): any[] {
    const activityCount: { [key: string]: number } = {};
    const activityMoodCorrelation: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      log.activities?.forEach((activity: string) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
        if (!activityMoodCorrelation[activity]) {
          activityMoodCorrelation[activity] = [];
        }
        activityMoodCorrelation[activity].push(log.mood);
      });
    });

    return Object.entries(activityCount).map(([activity, frequency]) => {
      const moods = activityMoodCorrelation[activity];
      const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
      const correlation = avgMood > 3.5 ? 1 : avgMood < 2.5 ? -1 : 0;

      return {
        activity,
        frequency,
        correlation,
        impact: correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'neutral',
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
      const avgIntensity = intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length;

      return {
        emotion,
        frequency,
        intensity: avgIntensity,
        triggers: [],
      };
    });
  }

  // Calcular métricas de bienestar
  private calculateWellnessMetrics(moodLogs: any[]): any {
    const sleepValues = moodLogs.map((log) => log.sleep).filter((sleep) => sleep !== undefined);
    const energyValues = moodLogs.map((log) => log.energy).filter((energy) => energy !== undefined);
    const stressValues = moodLogs.map((log) => log.stress).filter((stress) => stress !== undefined);

    return {
      sleep: {
        average: sleepValues.length > 0 ? sleepValues.reduce((sum, sleep) => sum + sleep, 0) / sleepValues.length : 0,
        trend: 'stable',
        quality:
          sleepValues.length > 0 && sleepValues.reduce((sum, sleep) => sum + sleep, 0) / sleepValues.length > 3.5
            ? 'good'
            : 'fair',
      },
      energy: {
        average:
          energyValues.length > 0 ? energyValues.reduce((sum, energy) => sum + energy, 0) / energyValues.length : 0,
        trend: 'stable',
        peakHours: [],
      },
      stress: {
        average:
          stressValues.length > 0 ? stressValues.reduce((sum, stress) => sum + stress, 0) / stressValues.length : 0,
        trend: 'stable',
        triggers: [],
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
