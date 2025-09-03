// Notification Service for Mood Log App
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'message' | 'alert' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: any;
  expiresAt?: any;
}

export interface NotificationSettings {
  userId: string;
  reminders: {
    enabled: boolean;
    time: string; // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  achievements: boolean;
  messages: boolean;
  alerts: boolean;
  system: boolean;
}

class NotificationService {
  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('isRead', '==', false));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const updatePromises = notifications.map((notification) => this.markAsRead(notification.id));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create reminder notification
  async createReminderNotification(userId: string, message: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'reminder',
      title: 'Recordatorio',
      message,
      isRead: false,
      actionUrl: '/dashboard',
    });
  }

  // Create achievement notification
  async createAchievementNotification(userId: string, achievementName: string, description: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: '¡Nuevo Logro!',
      message: `Has desbloqueado: ${achievementName}`,
      isRead: false,
      actionUrl: '/dashboard?tab=achievements',
      metadata: {
        achievementName,
        description,
      },
    });
  }

  // Create message notification
  async createMessageNotification(userId: string, senderName: string, message: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'message',
      title: `Mensaje de ${senderName}`,
      message,
      isRead: false,
      actionUrl: '/chat',
    });
  }

  // Create alert notification
  async createAlertNotification(
    userId: string,
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: 'alert',
      title,
      message,
      isRead: false,
      actionUrl: '/dashboard',
      metadata: {
        severity,
      },
    });
  }

  // Create system notification
  async createSystemNotification(userId: string, title: string, message: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      isRead: false,
    });
  }

  // Get notification settings for a user
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const q = query(collection(db, 'notificationSettings'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as NotificationSettings;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const existingSettings = await this.getNotificationSettings(userId);

      if (existingSettings) {
        await updateDoc(doc(db, 'notificationSettings', userId), {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'notificationSettings'), {
          userId,
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Check if user should receive daily reminder
  shouldSendDailyReminder(userId: string, settings: NotificationSettings): boolean {
    if (!settings.reminders.enabled) return false;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    return settings.reminders.days.includes(currentDay) && currentTime === settings.reminders.time;
  }

  // Browser notification permission and display
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Show browser notification
  async showBrowserNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export const notificationService = new NotificationService();
