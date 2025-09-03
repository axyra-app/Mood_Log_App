import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Award, Calendar, Heart, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Activity {
  id: string;
  type: 'mood' | 'achievement' | 'chat' | 'progress';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
  bgColor: string;
  timestamp: Date;
}

const RecentActivities = () => {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementCount, setAchievementCount] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(5);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchRecentActivities();
    }
  }, [userProfile?.uid]);

  const fetchRecentActivities = async () => {
    if (!userProfile?.uid) return;

    try {
      const activitiesList: Activity[] = [];

      // Fetch recent mood logs
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);

      moodLogsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

        activitiesList.push({
          id: doc.id,
          type: 'mood',
          title: 'Estado de ánimo registrado',
          description: getMoodDescription(data.mood),
          time: getTimeAgo(createdAt),
          icon: Heart,
          color: getMoodColor(data.mood),
          bgColor: getMoodBgColor(data.mood),
          timestamp: createdAt,
        });
      });

      // Fetch recent notifications (achievements, messages, etc.)
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc'),
        limit(2)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);

      notificationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

        if (data.type === 'achievement') {
          activitiesList.push({
            id: doc.id,
            type: 'achievement',
            title: 'Nueva medalla desbloqueada',
            description: data.message || 'Logro desbloqueado',
            time: getTimeAgo(createdAt),
            icon: Award,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            timestamp: createdAt,
          });
        } else if (data.type === 'message') {
          activitiesList.push({
            id: doc.id,
            type: 'chat',
            title: 'Mensaje de tu psicólogo',
            description: data.message || 'Nuevo mensaje recibido',
            time: getTimeAgo(createdAt),
            icon: MessageCircle,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            timestamp: createdAt,
          });
        }
      });

      // Calculate achievement progress
      const achievementsQuery = query(collection(db, 'userAchievements'), where('userId', '==', userProfile.uid));
      const achievementsSnapshot = await getDocs(achievementsQuery);
      setAchievementCount(achievementsSnapshot.docs.length);

      // Sort activities by timestamp and take the most recent 4
      activitiesList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(activitiesList.slice(0, 4));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setLoading(false);
    }
  };

  const getMoodDescription = (mood: number) => {
    const descriptions = [
      'Te sentiste muy mal hoy',
      'Te sentiste mal hoy',
      'Te sentiste regular hoy',
      'Te sentiste bien hoy',
      'Te sentiste muy bien hoy',
    ];
    return descriptions[mood - 1] || 'Estado de ánimo registrado';
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'text-red-600';
    if (mood === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMoodBgColor = (mood: number) => {
    if (mood <= 2) return 'bg-red-50';
    if (mood === 3) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/2 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='flex items-start space-x-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <Calendar className='w-5 h-5 text-primary-600 mr-2' />
        Actividades Recientes
      </h3>

      <div className='space-y-4'>
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div
                  className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>{activity.title}</p>
                  <p className='text-sm text-gray-600'>{activity.description}</p>
                  <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-center py-8'>
            <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-500 text-sm'>No hay actividades recientes</p>
            <p className='text-gray-400 text-xs mt-1'>Registra tu estado de ánimo para ver actividades</p>
          </div>
        )}
      </div>

      <div className='mt-6 pt-4 border-t border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Award className='w-5 h-5 text-yellow-600' />
            <span className='text-sm font-medium text-gray-900'>Logros</span>
          </div>
          <div className='flex space-x-1'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i <= achievementCount ? 'bg-yellow-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <p className='text-xs text-gray-600 mt-2'>
          {achievementCount} de {totalAchievements} logros completados
        </p>
      </div>
    </div>
  );
};

export default RecentActivities;
