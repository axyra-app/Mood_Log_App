import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { BarChart3, Heart, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface MoodLog {
  id: string;
  mood: number;
  emotion: string;
  sentiment: string;
  intensity: number;
  activities: string[];
  wellness: {
    sleep: number;
    stress: number;
    energy: number;
    social: number;
  };
  habits: string[];
  createdAt: any;
}

interface Statistics {
  totalLogs: number;
  averageMood: number;
  moodTrend: number;
  mostCommonEmotion: string;
  averageSleep: number;
  averageStress: number;
  averageEnergy: number;
  averageSocial: number;
  weeklyData: Array<{
    day: string;
    mood: number;
    count: number;
  }>;
  monthlyData: Array<{
    week: string;
    mood: number;
    count: number;
  }>;
  activityFrequency: Array<{
    activity: string;
    count: number;
  }>;
  habitFrequency: Array<{
    habit: string;
    count: number;
  }>;
}

const Statistics = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    if (!userProfile?.uid) return;

    try {
      let startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = new Date(0); // Desde el inicio
          break;
      }

      const q = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile.uid),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MoodLog[];

      if (logs.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      // Calcular estadísticas
      const totalLogs = logs.length;
      const averageMood = logs.reduce((sum, log) => sum + log.mood, 0) / totalLogs;

      // Calcular tendencia
      const firstHalf = logs.slice(0, Math.ceil(logs.length / 2));
      const secondHalf = logs.slice(Math.ceil(logs.length / 2));
      const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;
      const moodTrend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

      // Emoción más común
      const emotionCounts: { [key: string]: number } = {};
      logs.forEach((log) => {
        emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
      });
      const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
      );

      // Promedios de bienestar
      const averageSleep = logs.reduce((sum, log) => sum + log.wellness.sleep, 0) / totalLogs;
      const averageStress = logs.reduce((sum, log) => sum + log.wellness.stress, 0) / totalLogs;
      const averageEnergy = logs.reduce((sum, log) => sum + log.wellness.energy, 0) / totalLogs;
      const averageSocial = logs.reduce((sum, log) => sum + log.wellness.social, 0) / totalLogs;

      // Datos semanales
      const weeklyData = calculateWeeklyData(logs);
      const monthlyData = calculateMonthlyData(logs);

      // Frecuencia de actividades
      const activityCounts: { [key: string]: number } = {};
      logs.forEach((log) => {
        log.activities.forEach((activity) => {
          activityCounts[activity] = (activityCounts[activity] || 0) + 1;
        });
      });
      const activityFrequency = Object.entries(activityCounts)
        .map(([activity, count]) => ({ activity, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Frecuencia de hábitos
      const habitCounts: { [key: string]: number } = {};
      logs.forEach((log) => {
        log.habits.forEach((habit) => {
          habitCounts[habit] = (habitCounts[habit] || 0) + 1;
        });
      });
      const habitFrequency = Object.entries(habitCounts)
        .map(([habit, count]) => ({ habit, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalLogs,
        averageMood: Math.round(averageMood * 10) / 10,
        moodTrend: Math.round(moodTrend),
        mostCommonEmotion,
        averageSleep: Math.round(averageSleep * 10) / 10,
        averageStress: Math.round(averageStress * 10) / 10,
        averageEnergy: Math.round(averageEnergy * 10) / 10,
        averageSocial: Math.round(averageSocial * 10) / 10,
        weeklyData,
        monthlyData,
        activityFrequency,
        habitFrequency,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const calculateWeeklyData = (logs: MoodLog[]) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyData = days.map((day) => ({ day, mood: 0, count: 0 }));

    logs.forEach((log) => {
      const date = log.createdAt.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      const dayIndex = date.getDay();
      weeklyData[dayIndex].mood += log.mood;
      weeklyData[dayIndex].count += 1;
    });

    return weeklyData.map((day) => ({
      ...day,
      mood: day.count > 0 ? Math.round((day.mood / day.count) * 10) / 10 : 0,
    }));
  };

  const calculateMonthlyData = (logs: MoodLog[]) => {
    const monthlyData: Array<{ week: string; mood: number; count: number }> = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekLogs = logs.filter((log) => {
        const logDate = log.createdAt.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const weekMood = weekLogs.length > 0 ? weekLogs.reduce((sum, log) => sum + log.mood, 0) / weekLogs.length : 0;

      monthlyData.push({
        week: `Semana ${4 - i}`,
        mood: Math.round(weekMood * 10) / 10,
        count: weekLogs.length,
      });
    }

    return monthlyData;
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[Math.round(mood) - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'text-red-500';
    if (mood <= 3) return 'text-orange-500';
    if (mood <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='grid grid-cols-4 gap-4 mb-6'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-20 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6 text-center'>
        <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Sin datos suficientes</h3>
        <p className='text-gray-600'>Registra más estados de ánimo para ver estadísticas detalladas</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <BarChart3 className='w-6 h-6 text-primary-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Estadísticas Detalladas</h3>
        </div>

        <div className='flex gap-2'>
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? '7 días' : range === 'month' ? '30 días' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas principales */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center'>
          <Heart className='w-6 h-6 text-blue-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-blue-600'>{stats.totalLogs}</div>
          <div className='text-sm text-blue-600'>Registros Totales</div>
        </div>

        <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center'>
          <BarChart3 className='w-6 h-6 text-green-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-green-600'>{stats.averageMood}</div>
          <div className='text-sm text-green-600'>Promedio de Ánimo</div>
        </div>

        <div
          className={`rounded-lg p-4 text-center ${
            stats.moodTrend >= 0
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100'
              : 'bg-gradient-to-r from-red-50 to-red-100'
          }`}
        >
          <TrendingUp
            className={`w-6 h-6 mx-auto mb-2 ${stats.moodTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
          />
          <div className={`text-2xl font-bold ${stats.moodTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.moodTrend > 0 ? '+' : ''}
            {stats.moodTrend}%
          </div>
          <div className={`text-sm ${stats.moodTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Tendencia</div>
        </div>

        <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center'>
          <Zap className='w-6 h-6 text-purple-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-purple-600'>{stats.mostCommonEmotion}</div>
          <div className='text-sm text-purple-600'>Emoción Frecuente</div>
        </div>
      </div>

      {/* Gráfico de estado de ánimo semanal */}
      <div className='mb-8'>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>Estado de Ánimo por Día</h4>
        <div className='bg-gray-50 rounded-lg p-4'>
          <div className='flex items-end justify-between h-32 gap-2'>
            {stats.weeklyData.map((day, index) => (
              <div key={index} className='flex flex-col items-center flex-1'>
                <div
                  className='w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-500'
                  style={{ height: `${(day.mood / 5) * 100}%` }}
                ></div>
                <div className='text-xs text-gray-600 mt-2'>{day.day}</div>
                <div className='text-xs font-medium text-gray-800'>{day.mood || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de bienestar */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-blue-50 rounded-lg p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>{stats.averageSleep}</div>
          <div className='text-sm text-blue-600'>Sueño Promedio</div>
        </div>
        <div className='bg-orange-50 rounded-lg p-4 text-center'>
          <div className='text-2xl font-bold text-orange-600'>{stats.averageStress}</div>
          <div className='text-sm text-orange-600'>Estrés Promedio</div>
        </div>
        <div className='bg-green-50 rounded-lg p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>{stats.averageEnergy}</div>
          <div className='text-sm text-green-600'>Energía Promedio</div>
        </div>
        <div className='bg-purple-50 rounded-lg p-4 text-center'>
          <div className='text-2xl font-bold text-purple-600'>{stats.averageSocial}</div>
          <div className='text-sm text-purple-600'>Social Promedio</div>
        </div>
      </div>

      {/* Actividades más frecuentes */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>Actividades Frecuentes</h4>
          <div className='space-y-2'>
            {stats.activityFrequency.map((item, index) => (
              <div key={index} className='flex items-center justify-between bg-gray-50 rounded-lg p-3'>
                <span className='text-gray-700'>{item.activity}</span>
                <span className='bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full'>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>Hábitos Frecuentes</h4>
          <div className='space-y-2'>
            {stats.habitFrequency.map((item, index) => (
              <div key={index} className='flex items-center justify-between bg-gray-50 rounded-lg p-3'>
                <span className='text-gray-700'>{item.habit}</span>
                <span className='bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full'>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
