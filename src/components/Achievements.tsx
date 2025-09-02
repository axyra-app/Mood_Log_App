import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Award, Heart, MessageCircle, Star, Target, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'mood' | 'streak' | 'social' | 'wellness' | 'milestone';
  requirement: number;
  current: number;
  completed: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

const Achievements = () => {
  const { userProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [userProfile?.uid]);

  const fetchAchievements = async () => {
    try {
      // Definir logros del sistema
      const systemAchievements: Achievement[] = [
        {
          id: 'first_mood',
          title: 'Primer Paso',
          description: 'Registra tu primer estado de ánimo',
          icon: '🎯',
          category: 'mood',
          requirement: 1,
          current: 0,
          completed: false,
          rarity: 'common',
          points: 10,
        },
        {
          id: 'mood_streak_7',
          title: 'Semana Consistente',
          description: 'Registra tu estado de ánimo por 7 días consecutivos',
          icon: '🔥',
          category: 'streak',
          requirement: 7,
          current: 0,
          completed: false,
          rarity: 'rare',
          points: 50,
        },
        {
          id: 'mood_streak_30',
          title: 'Mes de Dedication',
          description: 'Registra tu estado de ánimo por 30 días consecutivos',
          icon: '💎',
          category: 'streak',
          requirement: 30,
          current: 0,
          completed: false,
          rarity: 'epic',
          points: 200,
        },
        {
          id: 'mood_streak_100',
          title: 'Centurión',
          description: 'Registra tu estado de ánimo por 100 días consecutivos',
          icon: '👑',
          category: 'streak',
          requirement: 100,
          current: 0,
          completed: false,
          rarity: 'legendary',
          points: 1000,
        },
        {
          id: 'total_moods_50',
          title: 'Explorador',
          description: 'Registra 50 estados de ánimo en total',
          icon: '🗺️',
          category: 'milestone',
          requirement: 50,
          current: 0,
          completed: false,
          rarity: 'rare',
          points: 100,
        },
        {
          id: 'total_moods_200',
          title: 'Veterano',
          description: 'Registra 200 estados de ánimo en total',
          icon: '🏆',
          category: 'milestone',
          requirement: 200,
          current: 0,
          completed: false,
          rarity: 'epic',
          points: 500,
        },
        {
          id: 'first_chat',
          title: 'Comunicador',
          description: 'Envía tu primer mensaje a un psicólogo',
          icon: '💬',
          category: 'social',
          requirement: 1,
          current: 0,
          completed: false,
          rarity: 'common',
          points: 25,
        },
        {
          id: 'chat_sessions_10',
          title: 'Conversador',
          description: 'Mantén 10 conversaciones con psicólogos',
          icon: '🤝',
          category: 'social',
          requirement: 10,
          current: 0,
          completed: false,
          rarity: 'rare',
          points: 75,
        },
        {
          id: 'positive_week',
          title: 'Semana Positiva',
          description: 'Mantén un estado de ánimo promedio de 4+ por una semana',
          icon: '☀️',
          category: 'wellness',
          requirement: 1,
          current: 0,
          completed: false,
          rarity: 'rare',
          points: 60,
        },
        {
          id: 'wellness_tracker',
          title: 'Bienestar Total',
          description: 'Registra métricas de bienestar por 14 días consecutivos',
          icon: '🧘',
          category: 'wellness',
          requirement: 14,
          current: 0,
          completed: false,
          rarity: 'epic',
          points: 150,
        },
      ];

      setAchievements(systemAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!userProfile?.uid) return;

    try {
      // Obtener logros del usuario
      const userAchievementsDoc = await getDoc(doc(db, 'userAchievements', userProfile.uid));
      const userAchievementsData = userAchievementsDoc.exists() ? userAchievementsDoc.data().achievements || [] : [];

      setUserAchievements(userAchievementsData);

      // Calcular estadísticas del usuario
      await calculateUserStats(userAchievementsData);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  const calculateUserStats = async (userAchievementsData: UserAchievement[]) => {
    if (!userProfile?.uid) return;

    try {
      // Obtener registros de estado de ánimo
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile.uid),
        where('createdAt', '>=', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) // Último año
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);
      const moodLogs = moodLogsSnapshot.docs.map((doc) => doc.data());

      // Obtener conversaciones
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where(`participants.${userProfile.uid}`, '==', true)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = conversationsSnapshot.docs.map((doc) => doc.id);

      // Calcular estadísticas
      const stats = {
        totalMoods: moodLogs.length,
        currentStreak: calculateCurrentStreak(moodLogs),
        totalChats: conversations.length,
        positiveWeeks: calculatePositiveWeeks(moodLogs),
        wellnessDays: calculateWellnessDays(moodLogs),
      };

      // Actualizar progreso de logros
      const updatedAchievements = achievements.map((achievement) => {
        let current = 0;
        let completed = false;

        switch (achievement.id) {
          case 'first_mood':
            current = stats.totalMoods;
            completed = stats.totalMoods >= 1;
            break;
          case 'mood_streak_7':
            current = stats.currentStreak;
            completed = stats.currentStreak >= 7;
            break;
          case 'mood_streak_30':
            current = stats.currentStreak;
            completed = stats.currentStreak >= 30;
            break;
          case 'mood_streak_100':
            current = stats.currentStreak;
            completed = stats.currentStreak >= 100;
            break;
          case 'total_moods_50':
            current = stats.totalMoods;
            completed = stats.totalMoods >= 50;
            break;
          case 'total_moods_200':
            current = stats.totalMoods;
            completed = stats.totalMoods >= 200;
            break;
          case 'first_chat':
            current = stats.totalChats;
            completed = stats.totalChats >= 1;
            break;
          case 'chat_sessions_10':
            current = stats.totalChats;
            completed = stats.totalChats >= 10;
            break;
          case 'positive_week':
            current = stats.positiveWeeks;
            completed = stats.positiveWeeks >= 1;
            break;
          case 'wellness_tracker':
            current = stats.wellnessDays;
            completed = stats.wellnessDays >= 14;
            break;
        }

        return { ...achievement, current, completed };
      });

      setAchievements(updatedAchievements);

      // Calcular puntos totales
      const totalPoints = updatedAchievements
        .filter((achievement) => achievement.completed)
        .reduce((sum, achievement) => sum + achievement.points, 0);
      setTotalPoints(totalPoints);

      setLoading(false);
    } catch (error) {
      console.error('Error calculating user stats:', error);
    }
  };

  const calculateCurrentStreak = (moodLogs: any[]) => {
    if (moodLogs.length === 0) return 0;

    const sortedLogs = moodLogs.sort((a, b) => {
      const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = sortedLogs[i].createdAt.toDate
        ? sortedLogs[i].createdAt.toDate()
        : new Date(sortedLogs[i].createdAt);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculatePositiveWeeks = (moodLogs: any[]) => {
    const weeklyAverages: { [key: string]: number[] } = {};

    moodLogs.forEach((log) => {
      const date = log.createdAt.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      const weekKey = getWeekKey(date);

      if (!weeklyAverages[weekKey]) {
        weeklyAverages[weekKey] = [];
      }
      weeklyAverages[weekKey].push(log.mood);
    });

    let positiveWeeks = 0;
    Object.values(weeklyAverages).forEach((weekMoods) => {
      if (weekMoods.length >= 3) {
        // Mínimo 3 registros por semana
        const average = weekMoods.reduce((sum, mood) => sum + mood, 0) / weekMoods.length;
        if (average >= 4) {
          positiveWeeks++;
        }
      }
    });

    return positiveWeeks;
  };

  const calculateWellnessDays = (moodLogs: any[]) => {
    return moodLogs.filter(
      (log) =>
        log.wellness &&
        (log.wellness.sleep > 0 || log.wellness.stress > 0 || log.wellness.energy > 0 || log.wellness.social > 0)
    ).length;
  };

  const getWeekKey = (date: Date) => {
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week}`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'epic':
        return 'text-purple-600 bg-purple-100';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mood':
        return <Heart className='w-5 h-5' />;
      case 'streak':
        return <Zap className='w-5 h-5' />;
      case 'social':
        return <MessageCircle className='w-5 h-5' />;
      case 'wellness':
        return <Target className='w-5 h-5' />;
      case 'milestone':
        return <Trophy className='w-5 h-5' />;
      default:
        return <Award className='w-5 h-5' />;
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-24 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <Trophy className='w-6 h-6 text-primary-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Logros</h3>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold text-primary-600'>{totalPoints}</div>
          <div className='text-sm text-gray-500'>Puntos Totales</div>
        </div>
      </div>

      {/* Resumen de logros */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center'>
          <Trophy className='w-6 h-6 text-green-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-green-600'>{achievements.filter((a) => a.completed).length}</div>
          <div className='text-sm text-green-600'>Completados</div>
        </div>
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center'>
          <Target className='w-6 h-6 text-blue-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-blue-600'>
            {achievements.length - achievements.filter((a) => a.completed).length}
          </div>
          <div className='text-sm text-blue-600'>Pendientes</div>
        </div>
        <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center'>
          <Star className='w-6 h-6 text-purple-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-purple-600'>
            {achievements.filter((a) => a.completed && a.rarity === 'legendary').length}
          </div>
          <div className='text-sm text-purple-600'>Legendarios</div>
        </div>
        <div className='bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 text-center'>
          <Zap className='w-6 h-6 text-orange-600 mx-auto mb-2' />
          <div className='text-2xl font-bold text-orange-600'>
            {Math.round((achievements.filter((a) => a.completed).length / achievements.length) * 100)}%
          </div>
          <div className='text-sm text-orange-600'>Progreso</div>
        </div>
      </div>

      {/* Lista de logros */}
      <div className='space-y-4'>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>Todos los Logros</h4>
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              achievement.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  {achievement.completed ? '✅' : achievement.icon}
                </div>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <h5 className={`font-semibold ${achievement.completed ? 'text-green-800' : 'text-gray-900'}`}>
                      {achievement.title}
                    </h5>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}
                    >
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mb-2'>{achievement.description}</p>
                  <div className='flex items-center gap-4 text-xs text-gray-500'>
                    <div className='flex items-center gap-1'>
                      {getCategoryIcon(achievement.category)}
                      <span>{achievement.category}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Star className='w-3 h-3' />
                      <span>{achievement.points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className={`text-lg font-bold ${achievement.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  {achievement.current}/{achievement.requirement}
                </div>
                <div className='w-20 bg-gray-200 rounded-full h-2 mt-1'>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      achievement.completed ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
