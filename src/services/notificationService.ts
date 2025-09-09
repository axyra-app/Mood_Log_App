import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { NotificationSettings, PushNotification } from '../types';
import { db } from './firebase';

// Notification Management Functions
export const createNotification = async (
  notificationData: Omit<PushNotification, 'id' | 'sentAt'>
): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      sentAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getNotifications = async (userId: string, limitCount: number = 50): Promise<PushNotification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('sentAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PushNotification[];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (userId: string): Promise<PushNotification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('sentAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PushNotification[];
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('read', '==', false));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Real-time notification updates
export const subscribeToNotifications = (userId: string, callback: (notifications: PushNotification[]) => void) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId), orderBy('sentAt', 'desc'), limit(50));

  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PushNotification[];
    callback(notifications);
  });
};

// Notification Settings
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings | null> => {
  try {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as NotificationSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<void> => {
  try {
    const settingsRef = doc(db, 'notificationSettings', userId);
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

export const createDefaultNotificationSettings = async (userId: string): Promise<void> => {
  try {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const defaultSettings: NotificationSettings = {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      appointmentReminders: true,
      moodCheckReminders: true,
      messageNotifications: true,
      weeklyReports: true,
      emergencyAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      timezone: typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    };

    await updateDoc(settingsRef, {
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating default notification settings:', error);
    throw error;
  }
};

// Specific notification types
export const sendAppointmentReminder = async (
  userId: string,
  appointmentTitle: string,
  appointmentTime: Date,
  data?: any
): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title: 'Recordatorio de Cita',
      body: `Tienes una cita: ${appointmentTitle} a las ${appointmentTime.toLocaleTimeString()}`,
      type: 'appointment' as const,
      data: {
        appointmentTime: appointmentTime.toISOString(),
        ...data,
      },
      read: false,
      scheduledFor: appointmentTime,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    throw error;
  }
};

export const sendMoodCheckReminder = async (userId: string, data?: any): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title: '¿Cómo te sientes hoy?',
      body: 'Es hora de registrar tu estado de ánimo diario',
      type: 'mood_check' as const,
      data,
      read: false,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error sending mood check reminder:', error);
    throw error;
  }
};

export const sendMessageNotification = async (
  userId: string,
  senderName: string,
  messagePreview: string,
  chatId: string
): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title: `Mensaje de ${senderName}`,
      body: messagePreview,
      type: 'message' as const,
      data: { chatId },
      read: false,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error sending message notification:', error);
    throw error;
  }
};

export const sendEmergencyAlert = async (userId: string, message: string, data?: any): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title: '🚨 Alerta de Emergencia',
      body: message,
      type: 'emergency' as const,
      data,
      read: false,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    throw error;
  }
};

export const sendWeeklyReport = async (userId: string, reportData: any): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title: '📊 Tu Reporte Semanal',
      body: 'Revisa tu progreso emocional de esta semana',
      type: 'general' as const,
      data: reportData,
      read: false,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error sending weekly report:', error);
    throw error;
  }
};

// Browser push notification support
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  return await Notification.requestPermission();
};

export const sendBrowserNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

// Scheduled notifications
export const scheduleNotification = async (
  userId: string,
  title: string,
  body: string,
  scheduledFor: Date,
  type: PushNotification['type'] = 'general',
  data?: any
): Promise<string> => {
  try {
    const notificationData = {
      userId,
      title,
      body,
      type,
      data,
      read: false,
      scheduledFor,
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

// Notification analytics
export const getNotificationStats = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map((doc) => doc.data()) as PushNotification[];

    const total = notifications.length;
    const read = notifications.filter((n) => n.read).length;
    const unread = total - read;

    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      read,
      unread,
      byType,
      readRate: total > 0 ? (read / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw error;
  }
};
