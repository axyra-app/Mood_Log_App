// Achievement Service for Mood Log App
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'mood' | 'wellness' | 'social' | 'milestone';
  requirement: {
    type: 'count' | 'streak' | 'average' | 'consecutive';
    value: number;
    metric: string;
  };
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: any;
  progress?: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: any;
  progress: number;
  isUnlocked: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  required: number;
  percentage: number;
  isUnlocked: boolean;
}

class AchievementService {
  private achievements: Achievement[] = [
    {
      id: 'first_mood',
      name: 'Primer Paso',
      description: 'Registra tu primer estado de ánimo',
      icon: '🎯',
      category: 'milestone',
      requirement: { type: 'count', value: 1, metric: 'mood_logs' },
      points: 10,
      rarity: 'common',
    },
    {
      id: 'week_streak',
      name: 'Constancia Semanal',
      description: 'Registra tu estado de ánimo por 7 días consecutivos',
      icon: '📅',
      category: 'streak',
      requirement: { type: 'streak', value: 7, metric: 'consecutive_days' },
      points: 50,
      rarity: 'rare',
    },
    {
      id: 'month_streak',
      name: 'Constancia Mensual',
      description: 'Registra tu estado de ánimo por 30 días consecutivos',
      icon: '🗓️',
      category: 'streak',
      requirement: { type: 'streak', value: 30, metric: 'consecutive_days' },
      points: 200,
      rarity: 'epic',
    },
    {
      id: 'positive_week',
      name: 'Semana Positiva',
      description: 'Mantén un estado de ánimo promedio de 4+ por una semana',
      icon: '😊',
      category: 'mood',
      requirement: { type: 'average', value: 4, metric: 'weekly_mood' },
      points: 75,
      rarity: 'rare',
    },
    {
      id: 'wellness_master',
      name: 'Maestro del Bienestar',
      description: 'Mantén todas las métricas de bienestar en 8+ por una semana',
      icon: '🌟',
      category: 'wellness',
      requirement: { type: 'average', value: 8, metric: 'wellness_score' },
      points: 100,
      rarity: 'epic',
    },
    {
      id: 'social_butterfly',
      name: 'Mariposa Social',
      description: 'Registra actividades sociales por 10 días',
      icon: '🦋',
      category: 'social',
      requirement: { type: 'count', value: 10, metric: 'social_activities' },
      points: 60,
      rarity: 'rare',
    },
    {
      id: 'meditation_master',
      name: 'Maestro de la Meditación',
      description: 'Practica meditación por 14 días consecutivos',
      icon: '🧘‍♀️',
      category: 'wellness',
      requirement: { type: 'streak', value: 14, metric: 'meditation_streak' },
      points: 80,
      rarity: 'rare',
    },
    {
      id: 'mood_analyst',
      name: 'Analista de Estados de Ánimo',
      description: 'Registra 50 estados de ánimo diferentes',
      icon: '📊',
      category: 'milestone',
      requirement: { type: 'count', value: 50, metric: 'mood_logs' },
      points: 150,
      rarity: 'epic',
    },
    {
      id: 'gratitude_champion',
      name: 'Campeón de la Gratitud',
      description: 'Practica gratitud por 21 días consecutivos',
      icon: '🙏',
      category: 'wellness',
      requirement: { type: 'streak', value: 21, metric: 'gratitude_streak' },
      points: 120,
      rarity: 'epic',
    },
    {
      id: 'legendary_consistency',
      name: 'Consistencia Legendaria',
      description: 'Registra tu estado de ánimo por 100 días consecutivos',
      icon: '👑',
      category: 'streak',
      requirement: { type: 'streak', value: 100, metric: 'consecutive_days' },
      points: 500,
      rarity: 'legendary',
    },
  ];

  // Get all available achievements
  getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get user's achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const q = query(collection(db, 'userAchievements'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserAchievement[];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  // Get user's achievement progress
  async getUserAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const progress: AchievementProgress[] = [];

      for (const achievement of this.achievements) {
        const userAchievement = userAchievements.find((ua) => ua.achievementId === achievement.id);

        if (userAchievement) {
          progress.push({
            achievementId: achievement.id,
            current: userAchievement.progress,
            required: achievement.requirement.value,
            percentage: Math.min(100, (userAchievement.progress / achievement.requirement.value) * 100),
            isUnlocked: userAchievement.isUnlocked,
          });
        } else {
          progress.push({
            achievementId: achievement.id,
            current: 0,
            required: achievement.requirement.value,
            percentage: 0,
            isUnlocked: false,
          });
        }
      }

      return progress;
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
      throw error;
    }
  }

  // Check and unlock achievements based on user data
  async checkAchievements(userId: string, moodData: any): Promise<string[]> {
    const unlockedAchievements: string[] = [];

    try {
      const userAchievements = await this.getUserAchievements(userId);
      const progress = await this.getUserAchievementProgress(userId);

      for (const achievement of this.achievements) {
        const currentProgress = progress.find((p) => p.achievementId === achievement.id);
        if (!currentProgress || currentProgress.isUnlocked) continue;

        let shouldUnlock = false;
        let newProgress = currentProgress.current;

        switch (achievement.requirement.type) {
          case 'count':
            if (achievement.requirement.metric === 'mood_logs') {
              newProgress = currentProgress.current + 1;
              shouldUnlock = newProgress >= achievement.requirement.value;
            }
            break;

          case 'streak':
            if (achievement.requirement.metric === 'consecutive_days') {
              // This would need to be calculated based on actual mood log dates
              // For now, we'll simulate it
              newProgress = currentProgress.current + 1;
              shouldUnlock = newProgress >= achievement.requirement.value;
            }
            break;

          case 'average':
            if (achievement.requirement.metric === 'weekly_mood') {
              // This would need to be calculated based on actual mood data
              // For now, we'll simulate it
              if (moodData.mood >= achievement.requirement.value) {
                newProgress = currentProgress.current + 1;
                shouldUnlock = newProgress >= 7; // 7 days for weekly average
              }
            }
            break;
        }

        // Update or create user achievement
        const existingUserAchievement = userAchievements.find((ua) => ua.achievementId === achievement.id);

        if (existingUserAchievement) {
          await updateDoc(doc(db, 'userAchievements', existingUserAchievement.id), {
            progress: newProgress,
            isUnlocked: shouldUnlock,
            unlockedAt: shouldUnlock ? serverTimestamp() : null,
          });
        } else {
          await addDoc(collection(db, 'userAchievements'), {
            userId,
            achievementId: achievement.id,
            progress: newProgress,
            isUnlocked: shouldUnlock,
            unlockedAt: shouldUnlock ? serverTimestamp() : null,
          });
        }

        if (shouldUnlock) {
          unlockedAchievements.push(achievement.id);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Get achievement by ID
  getAchievementById(achievementId: string): Achievement | undefined {
    return this.achievements.find((a) => a.id === achievementId);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter((a) => a.category === category);
  }

  // Get user's total points
  async getUserTotalPoints(userId: string): Promise<number> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      let totalPoints = 0;

      for (const userAchievement of userAchievements) {
        if (userAchievement.isUnlocked) {
          const achievement = this.getAchievementById(userAchievement.achievementId);
          if (achievement) {
            totalPoints += achievement.points;
          }
        }
      }

      return totalPoints;
    } catch (error) {
      console.error('Error calculating total points:', error);
      throw error;
    }
  }

  // Get rarity color
  getRarityColor(rarity: string): string {
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
  }

  // Get rarity border color
  getRarityBorderColor(rarity: string): string {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'rare':
        return 'border-blue-300';
      case 'epic':
        return 'border-purple-300';
      case 'legendary':
        return 'border-yellow-300';
      default:
        return 'border-gray-300';
    }
  }
}

export const achievementService = new AchievementService();
