import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Calendar, Clock, Heart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface MoodLog {
  id: string;
  mood: number;
  description: string;
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

const DailyRegistry = () => {
  const { userProfile } = useAuth();
  const [todayLogs, setTodayLogs] = useState<MoodLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    averageMood: 0,
    totalLogs: 0,
    improvement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayLogs();
    fetchWeeklyStats();
  }, []);

  const fetchTodayLogs = async () => {
    if (!userProfile?.uid) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile.uid),
        where('createdAt', '>=', today),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MoodLog[];

      setTodayLogs(logs);
    } catch (error) {
      console.error('Error fetching today logs:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    if (!userProfile?.uid) return;

    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const q = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile.uid),
        where('createdAt', '>=', weekAgo),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MoodLog[];

      if (logs.length > 0) {
        const averageMood = logs.reduce((sum, log) => sum + log.mood, 0) / logs.length;
        const totalLogs = logs.length;

        // Calcular mejora comparando primera mitad vs segunda mitad de la semana
        const firstHalf = logs.slice(0, Math.ceil(logs.length / 2));
        const secondHalf = logs.slice(Math.ceil(logs.length / 2));

        const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;

        const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

        setWeeklyStats({
          averageMood: Math.round(averageMood * 10) / 10,
          totalLogs,
          improvement: Math.round(improvement),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    return colors[mood - 1] || 'text-gray-500';
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <div className='flex items-center gap-3 mb-6'>
        <Calendar className='w-6 h-6 text-primary-600' />
        <h3 className='text-xl font-semibold text-gray-900'>Registro Diario</h3>
      </div>

      {/* Estadísticas de la semana */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center'>
          <TrendingUp className='w-6 h-6 text-blue-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-blue-600'>{weeklyStats.averageMood}</div>
          <div className='text-sm text-blue-600'>Promedio Semanal</div>
        </div>
        <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center'>
          <Heart className='w-6 h-6 text-green-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-green-600'>{weeklyStats.totalLogs}</div>
          <div className='text-sm text-green-600'>Registros Esta Semana</div>
        </div>
        <div
          className={`rounded-lg p-4 text-center ${
            weeklyStats.improvement >= 0
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100'
              : 'bg-gradient-to-r from-red-50 to-red-100'
          }`}
        >
          <TrendingUp
            className={`w-6 h-6 mx-auto mb-2 ${weeklyStats.improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
          />
          <div className={`text-2xl font-bold ${weeklyStats.improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {weeklyStats.improvement > 0 ? '+' : ''}
            {weeklyStats.improvement}%
          </div>
          <div className={`text-sm ${weeklyStats.improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Mejora Semanal
          </div>
        </div>
      </div>

      {/* Registros de hoy */}
      <div>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>Registros de Hoy</h4>
        {todayLogs.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <Heart className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No has registrado tu estado de ánimo hoy</p>
            <p className='text-sm'>¡Comparte cómo te sientes!</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {todayLogs.map((log) => (
              <div key={log.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>{getMoodEmoji(log.mood)}</span>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {log.emotion} ({log.sentiment})
                      </div>
                      <div className='text-sm text-gray-500'>Intensidad: {log.intensity}%</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Clock className='w-4 h-4' />
                    {formatTime(log.createdAt)}
                  </div>
                </div>

                {log.description && <p className='text-gray-700 mb-3'>{log.description}</p>}

                {log.activities.length > 0 && (
                  <div className='mb-3'>
                    <div className='text-sm font-medium text-gray-600 mb-1'>Actividades:</div>
                    <div className='flex flex-wrap gap-1'>
                      {log.activities.map((activity, index) => (
                        <span key={index} className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className='grid grid-cols-4 gap-2 text-xs'>
                  <div className='text-center'>
                    <div className='font-medium text-gray-600'>Sueño</div>
                    <div className='text-blue-600'>{log.wellness.sleep}/10</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-gray-600'>Estrés</div>
                    <div className='text-orange-600'>{log.wellness.stress}/10</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-gray-600'>Energía</div>
                    <div className='text-green-600'>{log.wellness.energy}/10</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-gray-600'>Social</div>
                    <div className='text-purple-600'>{log.wellness.social}/10</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRegistry;
