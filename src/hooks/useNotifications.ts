import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Notification, notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.uid) {
      loadNotifications();
    }
  }, [userProfile?.uid]);

  const loadNotifications = async () => {
    if (!userProfile?.uid) return;

    try {
      const userNotifications = await notificationService.getUserNotifications(userProfile.uid);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userProfile!.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const id = await notificationService.createNotification(notification);
      const newNotification = { ...notification, id, createdAt: new Date() };
      setNotifications((prev) => [newNotification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
      return id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    refresh: loadNotifications,
  };
};
