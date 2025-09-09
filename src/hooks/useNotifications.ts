import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createDefaultNotificationSettings,
  deleteNotification,
  getNotificationSettings,
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  requestNotificationPermission,
  sendBrowserNotification,
  subscribeToNotifications,
  updateNotificationSettings,
} from '../services/notificationService';
import { NotificationSettings, PushNotification } from '../types';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(user.uid),
        getUnreadNotifications(user.uid),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load notification settings
  const loadSettings = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const settingsData = await getNotificationSettings(user.uid);
      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Create default settings
        await createDefaultNotificationSettings(user.uid);
        const defaultSettings = await getNotificationSettings(user.uid);
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking all notifications as read');
    }
  }, [user?.uid]);

  // Delete notification
  const deleteNotificationEntry = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notification');
    }
  }, []);

  // Update notification settings
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!user?.uid) return;

      try {
        await updateNotificationSettings(user.uid, newSettings);
        setSettings((prev) => (prev ? { ...prev, ...newSettings } : null));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating notification settings');
      }
    },
    [user?.uid]
  );

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const permissionResult = await requestNotificationPermission();
      setPermission(permissionResult);
      return permissionResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error requesting notification permission');
      return 'denied';
    }
  }, []);

  // Send browser notification
  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission === 'granted') {
        sendBrowserNotification(title, options);
      }
    },
    [permission]
  );

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: PushNotification['type']) => {
      return notifications.filter((notif) => notif.type === type);
    },
    [notifications]
  );

  // Get recent notifications
  const getRecentNotifications = useCallback(
    (limit: number = 5) => {
      return notifications.slice(0, limit);
    },
    [notifications]
  );

  // Check if user has unread notifications
  const hasUnreadNotifications = useCallback(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const read = notifications.filter((notif) => notif.read).length;
    const unread = total - read;

    const byType = notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      read,
      unread,
      byType,
      readRate: total > 0 ? (read / total) * 100 : 0,
    };
  }, [notifications]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.uid) return;

    loadNotifications();
    loadSettings();

    const unsubscribe = subscribeToNotifications(user.uid, (notificationsData) => {
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((notif) => !notif.read).length);
    });

    return () => unsubscribe();
  }, [user?.uid, loadNotifications, loadSettings]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    permission,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationEntry,
    updateSettings,
    requestPermission,
    sendNotification,
    getNotificationsByType,
    getRecentNotifications,
    hasUnreadNotifications,
    getNotificationStats,
    refreshNotifications: loadNotifications,
    refreshSettings: loadSettings,
  };
};
