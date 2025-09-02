import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { offlineService } from '../offlineService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('OfflineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isDeviceOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      navigator.onLine = true;
      expect(offlineService.isDeviceOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      navigator.onLine = false;
      expect(offlineService.isDeviceOnline()).toBe(false);
    });
  });

  describe('saveMoodLogOffline', () => {
    it('should save mood log to localStorage', () => {
      const moodData = {
        mood: 4,
        description: 'Great day!',
        activities: ['work'],
        wellness: { sleep: 8, stress: 3, energy: 7, social: 6 },
        habits: { exercise: true, meditation: false, nutrition: true, gratitude: true },
      };

      offlineService.saveMoodLogOffline(moodData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mood_log_offline_data',
        expect.stringContaining('Great day!')
      );
    });

    it('should add item to sync queue', () => {
      const moodData = {
        mood: 4,
        description: 'Great day!',
        activities: ['work'],
        wellness: { sleep: 8, stress: 3, energy: 7, social: 6 },
        habits: { exercise: true, meditation: false, nutrition: true, gratitude: true },
      };

      offlineService.saveMoodLogOffline(moodData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('mood_log_sync_queue', expect.stringContaining('moodLog'));
    });
  });

  describe('getOfflineMoodLogs', () => {
    it('should return empty array when no offline data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const logs = offlineService.getOfflineMoodLogs();
      expect(logs).toEqual([]);
    });

    it('should return mood logs from localStorage', () => {
      const mockData = {
        moodLogs: [
          { id: '1', mood: 4, description: 'Great day!' },
          { id: '2', mood: 3, description: 'Okay day' },
        ],
        lastSync: new Date(),
        pendingSync: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      const logs = offlineService.getOfflineMoodLogs();
      expect(logs).toEqual(mockData.moodLogs);
    });
  });

  describe('getSyncQueue', () => {
    it('should return empty array when no sync queue exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const queue = offlineService.getSyncQueue();
      expect(queue).toEqual([]);
    });

    it('should return sync queue from localStorage', () => {
      const mockQueue = [
        { type: 'moodLog', data: { id: '1' }, timestamp: new Date(), attempts: 0 },
        { type: 'moodLog', data: { id: '2' }, timestamp: new Date(), attempts: 1 },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockQueue));
      const queue = offlineService.getSyncQueue();
      expect(queue).toEqual(mockQueue);
    });
  });

  describe('getOfflineStatus', () => {
    it('should return correct offline status', () => {
      const mockData = {
        moodLogs: [{ id: '1' }],
        lastSync: new Date('2024-01-01'),
        pendingSync: true,
      };

      const mockQueue = [{ type: 'moodLog', data: { id: '1' } }];

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockData))
        .mockReturnValueOnce(JSON.stringify(mockQueue));

      const status = offlineService.getOfflineStatus();

      expect(status.isOnline).toBe(true);
      expect(status.pendingItems).toBe(1);
      expect(status.lastSync).toEqual(new Date('2024-01-01'));
    });
  });

  describe('clearOfflineData', () => {
    it('should clear all offline data from localStorage', () => {
      offlineService.clearOfflineData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mood_log_offline_data');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mood_log_sync_queue');
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage usage information', () => {
      // Mock localStorage with some data
      const mockLocalStorage = {
        key1: 'value1',
        key2: 'value2',
        mood_log_offline_data: JSON.stringify({ moodLogs: [] }),
      };

      Object.defineProperty(localStorage, 'length', {
        value: Object.keys(mockLocalStorage).length,
      });

      Object.defineProperty(localStorage, 'key', {
        value: (index: number) => Object.keys(mockLocalStorage)[index],
      });

      Object.defineProperty(localStorage, 'getItem', {
        value: (key: string) => mockLocalStorage[key as keyof typeof mockLocalStorage],
      });

      const usage = offlineService.getStorageUsage();

      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(usage).toHaveProperty('percentage');
      expect(usage.used).toBeGreaterThan(0);
      expect(usage.available).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isStorageFull', () => {
    it('should return false when storage usage is below 80%', () => {
      vi.spyOn(offlineService, 'getStorageUsage').mockReturnValue({
        used: 1000000, // 1MB
        available: 5000000, // 5MB
        percentage: 20,
      });

      expect(offlineService.isStorageFull()).toBe(false);
    });

    it('should return true when storage usage is above 80%', () => {
      vi.spyOn(offlineService, 'getStorageUsage').mockReturnValue({
        used: 4500000, // 4.5MB
        available: 5000000, // 5MB
        percentage: 90,
      });

      expect(offlineService.isStorageFull()).toBe(true);
    });
  });
});
