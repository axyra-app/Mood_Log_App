import { describe, expect, it, vi } from 'vitest';
import { notificationService } from '../notificationService';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

describe('NotificationService', () => {
  describe('shouldSendDailyReminder', () => {
    it('should return false when reminders are disabled', () => {
      const settings = {
        userId: 'user123',
        reminders: {
          enabled: false,
          time: '20:00',
          days: [1, 2, 3, 4, 5],
        },
        achievements: true,
        messages: true,
        alerts: true,
        system: true,
      };

      const result = notificationService.shouldSendDailyReminder('user123', settings);
      expect(result).toBe(false);
    });

    it('should return true when reminders are enabled and conditions are met', () => {
      const settings = {
        userId: 'user123',
        reminders: {
          enabled: true,
          time: '20:00',
          days: [1, 2, 3, 4, 5], // Monday to Friday
        },
        achievements: true,
        messages: true,
        alerts: true,
        system: true,
      };

      // Mock current time to be Monday at 20:00
      const mockDate = new Date('2024-01-15T20:00:00'); // Monday
      vi.setSystemTime(mockDate);

      const result = notificationService.shouldSendDailyReminder('user123', settings);
      expect(result).toBe(true);
    });

    it('should return false when current day is not in reminder days', () => {
      const settings = {
        userId: 'user123',
        reminders: {
          enabled: true,
          time: '20:00',
          days: [1, 2, 3, 4, 5], // Monday to Friday
        },
        achievements: true,
        messages: true,
        alerts: true,
        system: true,
      };

      // Mock current time to be Sunday at 20:00
      const mockDate = new Date('2024-01-14T20:00:00'); // Sunday
      vi.setSystemTime(mockDate);

      const result = notificationService.shouldSendDailyReminder('user123', settings);
      expect(result).toBe(false);
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return true when permission is already granted', async () => {
      // Mock Notification.permission
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: vi.fn(),
        },
        writable: true,
      });

      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: vi.fn(),
        },
        writable: true,
      });

      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(false);
    });

    it('should request permission when not set', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted');

      Object.defineProperty(global, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
      });

      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return false when browser does not support notifications', async () => {
      // Remove Notification from global
      delete (global as any).Notification;

      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(false);
    });
  });

  describe('showBrowserNotification', () => {
    it('should show notification when permission is granted', async () => {
      const mockNotification = {
        close: vi.fn(),
        onclick: null,
      };

      Object.defineProperty(global, 'Notification', {
        value: vi.fn().mockImplementation(() => mockNotification),
        writable: true,
      });

      // Mock Notification.permission
      Object.defineProperty(global.Notification, 'permission', {
        value: 'granted',
        writable: true,
      });

      await notificationService.showBrowserNotification('Test Title', {
        body: 'Test body',
      });

      expect(global.Notification).toHaveBeenCalledWith('Test Title', {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        body: 'Test body',
      });
    });

    it('should not show notification when permission is not granted', async () => {
      const mockNotification = vi.fn();

      Object.defineProperty(global, 'Notification', {
        value: mockNotification,
        writable: true,
      });

      // Mock Notification.permission
      Object.defineProperty(global.Notification, 'permission', {
        value: 'denied',
        writable: true,
      });

      await notificationService.showBrowserNotification('Test Title');

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should not show notification when browser does not support notifications', async () => {
      delete (global as any).Notification;

      // Should not throw error
      await expect(notificationService.showBrowserNotification('Test Title')).resolves.toBeUndefined();
    });
  });
});
