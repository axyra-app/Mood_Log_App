import { describe, expect, it, vi } from 'vitest';
import { achievementService } from '../achievementService';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

describe('AchievementService', () => {
  describe('getAllAchievements', () => {
    it('should return all available achievements', () => {
      const achievements = achievementService.getAllAchievements();
      expect(achievements).toBeDefined();
      expect(achievements.length).toBeGreaterThan(0);
    });

    it('should return achievements with required properties', () => {
      const achievements = achievementService.getAllAchievements();
      const firstAchievement = achievements[0];

      expect(firstAchievement).toHaveProperty('id');
      expect(firstAchievement).toHaveProperty('name');
      expect(firstAchievement).toHaveProperty('description');
      expect(firstAchievement).toHaveProperty('icon');
      expect(firstAchievement).toHaveProperty('category');
      expect(firstAchievement).toHaveProperty('requirement');
      expect(firstAchievement).toHaveProperty('points');
      expect(firstAchievement).toHaveProperty('rarity');
    });
  });

  describe('getAchievementById', () => {
    it('should return achievement by valid ID', () => {
      const achievements = achievementService.getAllAchievements();
      const firstAchievement = achievements[0];

      const foundAchievement = achievementService.getAchievementById(firstAchievement.id);
      expect(foundAchievement).toEqual(firstAchievement);
    });

    it('should return undefined for invalid ID', () => {
      const foundAchievement = achievementService.getAchievementById('invalid-id');
      expect(foundAchievement).toBeUndefined();
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return achievements filtered by category', () => {
      const streakAchievements = achievementService.getAchievementsByCategory('streak');
      expect(streakAchievements).toBeDefined();
      expect(streakAchievements.length).toBeGreaterThan(0);

      streakAchievements.forEach((achievement) => {
        expect(achievement.category).toBe('streak');
      });
    });

    it('should return empty array for non-existent category', () => {
      const achievements = achievementService.getAchievementsByCategory('non-existent');
      expect(achievements).toEqual([]);
    });
  });

  describe('getRarityColor', () => {
    it('should return correct color for each rarity', () => {
      expect(achievementService.getRarityColor('common')).toBe('text-gray-600 bg-gray-100');
      expect(achievementService.getRarityColor('rare')).toBe('text-blue-600 bg-blue-100');
      expect(achievementService.getRarityColor('epic')).toBe('text-purple-600 bg-purple-100');
      expect(achievementService.getRarityColor('legendary')).toBe('text-yellow-600 bg-yellow-100');
    });

    it('should return default color for unknown rarity', () => {
      expect(achievementService.getRarityColor('unknown')).toBe('text-gray-600 bg-gray-100');
    });
  });

  describe('getRarityBorderColor', () => {
    it('should return correct border color for each rarity', () => {
      expect(achievementService.getRarityBorderColor('common')).toBe('border-gray-300');
      expect(achievementService.getRarityBorderColor('rare')).toBe('border-blue-300');
      expect(achievementService.getRarityBorderColor('epic')).toBe('border-purple-300');
      expect(achievementService.getRarityBorderColor('legendary')).toBe('border-yellow-300');
    });

    it('should return default border color for unknown rarity', () => {
      expect(achievementService.getRarityBorderColor('unknown')).toBe('border-gray-300');
    });
  });

  describe('achievement requirements', () => {
    it('should have valid requirement types', () => {
      const achievements = achievementService.getAllAchievements();

      achievements.forEach((achievement) => {
        const validTypes = ['count', 'streak', 'average', 'consecutive'];
        expect(validTypes).toContain(achievement.requirement.type);
        expect(achievement.requirement.value).toBeGreaterThan(0);
        expect(achievement.requirement.metric).toBeDefined();
      });
    });

    it('should have valid categories', () => {
      const achievements = achievementService.getAllAchievements();
      const validCategories = ['streak', 'mood', 'wellness', 'social', 'milestone'];

      achievements.forEach((achievement) => {
        expect(validCategories).toContain(achievement.category);
      });
    });

    it('should have valid rarities', () => {
      const achievements = achievementService.getAllAchievements();
      const validRarities = ['common', 'rare', 'epic', 'legendary'];

      achievements.forEach((achievement) => {
        expect(validRarities).toContain(achievement.rarity);
      });
    });

    it('should have positive points', () => {
      const achievements = achievementService.getAllAchievements();

      achievements.forEach((achievement) => {
        expect(achievement.points).toBeGreaterThan(0);
      });
    });
  });
});
