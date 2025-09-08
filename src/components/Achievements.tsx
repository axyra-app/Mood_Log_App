import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Calendar, 
  Heart, 
  Brain,
  Zap,
  Shield,
  Award,
  Crown,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'mood' | 'social' | 'wellness' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: any;
  progress: number;
}

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener datos del usuario para calcular logros
      const moodLogsRef = collection(db, 'moodLogs');
      const userMoodLogs = query(moodLogsRef, where('userId', '==', user.uid));
      const moodLogsSnapshot = await getDocs(userMoodLogs);
      const moodLogs = moodLogsSnapshot.docs.map(doc => doc.data());

      // Obtener logros desbloqueados
      const achievementsRef = collection(db, 'userAchievements');
      const userAchievements = query(achievementsRef, where('userId', '==', user.uid));
      const achievementsSnapshot = await getDocs(userAchievements);
      const unlockedAchievements = achievementsSnapshot.docs.map(doc => doc.data());

      // Definir todos los logros posibles
      const allAchievements: Achievement[] = [
        {
          id: 'first_mood',
          title: 'Primer Paso',
          description: 'Registra tu primer estado de ánimo',
          icon: 'star',
          category: 'mood',
          requirement: 1,
          unlocked: moodLogs.length >= 1,
          progress: Math.min(moodLogs.length, 1),
          unlockedAt: moodLogs.length >= 1 ? new Date() : undefined
        },
        {
          id: 'week_streak',
          title: 'Constancia Semanal',
          description: 'Registra tu estado de ánimo por 7 días consecutivos',
          icon: 'calendar',
          category: 'streak',
          requirement: 7,
          unlocked: calculateStreak(moodLogs) >= 7,
          progress: Math.min(calculateStreak(moodLogs), 7),
          unlockedAt: calculateStreak(moodLogs) >= 7 ? new Date() : undefined
        },
        {
          id: 'month_streak',
          title: 'Maratón Mensual',
          description: 'Registra tu estado de ánimo por 30 días consecutivos',
          icon: 'trophy',
          category: 'streak',
          requirement: 30,
          unlocked: calculateStreak(moodLogs) >= 30,
          progress: Math.min(calculateStreak(moodLogs), 30),
          unlockedAt: calculateStreak(moodLogs) >= 30 ? new Date() : undefined
        },
        {
          id: 'mood_explorer',
          title: 'Explorador de Emociones',
          description: 'Registra 10 estados de ánimo diferentes',
          icon: 'brain',
          category: 'mood',
          requirement: 10,
          unlocked: moodLogs.length >= 10,
          progress: Math.min(moodLogs.length, 10),
          unlockedAt: moodLogs.length >= 10 ? new Date() : undefined
        },
        {
          id: 'positive_week',
          title: 'Semana Positiva',
          description: 'Mantén un promedio de ánimo alto por 7 días',
          icon: 'heart',
          category: 'wellness',
          requirement: 7,
          unlocked: calculatePositiveDays(moodLogs) >= 7,
          progress: Math.min(calculatePositiveDays(moodLogs), 7),
          unlockedAt: calculatePositiveDays(moodLogs) >= 7 ? new Date() : undefined
        },
        {
          id: 'mood_master',
          title: 'Maestro del Estado de Ánimo',
          description: 'Registra 100 estados de ánimo',
          icon: 'crown',
          category: 'mood',
          requirement: 100,
          unlocked: moodLogs.length >= 100,
          progress: Math.min(moodLogs.length, 100),
          unlockedAt: moodLogs.length >= 100 ? new Date() : undefined
        },
        {
          id: 'early_bird',
          title: 'Madrugador',
          description: 'Registra tu estado de ánimo antes de las 8 AM por 5 días',
          icon: 'zap',
          category: 'special',
          requirement: 5,
          unlocked: calculateEarlyMornings(moodLogs) >= 5,
          progress: Math.min(calculateEarlyMornings(moodLogs), 5),
          unlockedAt: calculateEarlyMornings(moodLogs) >= 5 ? new Date() : undefined
        },
        {
          id: 'consistency_king',
          title: 'Rey de la Consistencia',
          description: 'Registra tu estado de ánimo por 100 días consecutivos',
          icon: 'shield',
          category: 'streak',
          requirement: 100,
          unlocked: calculateStreak(moodLogs) >= 100,
          progress: Math.min(calculateStreak(moodLogs), 100),
          unlockedAt: calculateStreak(moodLogs) >= 100 ? new Date() : undefined
        }
      ];

      setAchievements(allAchievements);
      
      // Verificar si hay nuevos logros desbloqueados
      checkNewAchievements(allAchievements, unlockedAchievements);
      
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (moodLogs: any[]): number => {
    if (moodLogs.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ordenar logs por fecha descendente
    const sortedLogs = moodLogs.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = sortedLogs[i].createdAt?.toDate ? sortedLogs[i].createdAt.toDate() : new Date(sortedLogs[i].createdAt);
      logDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const calculatePositiveDays = (moodLogs: any[]): number => {
    if (moodLogs.length === 0) return 0;
    
    // Obtener logs de los últimos 7 días
    const lastWeek = moodLogs.filter(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });
    
    // Contar días con mood >= 4
    const positiveDays = lastWeek.filter(log => log.mood >= 4).length;
    return positiveDays;
  };

  const calculateEarlyMornings = (moodLogs: any[]): number => {
    if (moodLogs.length === 0) return 0;
    
    // Contar logs registrados antes de las 8 AM
    const earlyMornings = moodLogs.filter(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      return logDate.getHours() < 8;
    }).length;
    
    return earlyMornings;
  };

  const checkNewAchievements = async (allAchievements: Achievement[], unlockedAchievements: any[]) => {
    if (!user) return;
    
    const newAchievements = allAchievements.filter(achievement => 
      achievement.unlocked && 
      !unlockedAchievements.some(unlocked => unlocked.achievementId === achievement.id)
    );
    
    // Guardar nuevos logros desbloqueados
    for (const achievement of newAchievements) {
      try {
        await addDoc(collection(db, 'userAchievements'), {
          userId: user.uid,
          achievementId: achievement.id,
          unlockedAt: serverTimestamp(),
          title: achievement.title,
          description: achievement.description
        });
      } catch (error) {
        console.error('Error saving achievement:', error);
      }
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      star: <Star className="w-6 h-6" />,
      calendar: <Calendar className="w-6 h-6" />,
      trophy: <Trophy className="w-6 h-6" />,
      brain: <Brain className="w-6 h-6" />,
      heart: <Heart className="w-6 h-6" />,
      crown: <Crown className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
      shield: <Shield className="w-6 h-6" />,
      award: <Award className="w-6 h-6" />
    };
    return icons[iconName] || <Star className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      streak: 'bg-orange-100 text-orange-600',
      mood: 'bg-blue-100 text-blue-600',
      social: 'bg-green-100 text-green-600',
      wellness: 'bg-pink-100 text-pink-600',
      special: 'bg-purple-100 text-purple-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando logros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Logros</h1>
          </div>
          <p className="text-gray-600">
            Desbloquea logros completando diferentes objetivos en tu viaje de bienestar
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Progreso General</h2>
            <span className="text-2xl font-bold text-primary-600">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {unlockedCount === totalCount 
              ? '¡Felicidades! Has desbloqueado todos los logros 🎉'
              : `${totalCount - unlockedCount} logros restantes`
            }
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {['streak', 'mood', 'wellness', 'special'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category === 'streak' ? 'Rachas' : 
               category === 'mood' ? 'Estado de Ánimo' :
               category === 'wellness' ? 'Bienestar' : 'Especiales'}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
                achievement.unlocked 
                  ? 'ring-2 ring-yellow-400 ring-opacity-50' 
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  achievement.unlocked 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {achievement.unlocked ? getIcon(achievement.icon) : <Lock className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                      {achievement.category === 'streak' ? 'Racha' : 
                       achievement.category === 'mood' ? 'Estado de Ánimo' :
                       achievement.category === 'wellness' ? 'Bienestar' : 'Especial'}
                    </span>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {achievement.progress}/{achievement.requirement}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay logros en esta categoría
            </h3>
            <p className="text-gray-600">
              Cambia de categoría para ver más logros disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;