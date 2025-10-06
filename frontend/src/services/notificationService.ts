import {
  addDoc,
  collection,
  doc,
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
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  psychologistId?: string;
  type: 'crisis_alert' | 'appointment_reminder' | 'mood_check' | 'achievement' | 'recommendation' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'health' | 'appointment' | 'achievement' | 'system' | 'crisis';
  data?: any;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  crisisAlerts: boolean;
  appointmentReminders: boolean;
  moodCheckReminders: boolean;
  achievementNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  timezone: string;
}

class NotificationService {
  private listeners: Map<string, () => void> = new Map();

  // Crear notificación
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Escuchar notificaciones en tiempo real
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    limitCount: number = 50
  ): () => void {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        scheduledFor: doc.data().scheduledFor?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Notification[];

      callback(notifications);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Escuchar notificaciones no leídas
  subscribeToUnreadNotifications(userId: string, callback: (count: number) => void): () => void {
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(unreadQuery, (querySnapshot) => {
      callback(querySnapshot.docs.length);
    });

    return unsubscribe;
  }

  // Crear notificación de crisis
  async createCrisisNotification(userId: string, psychologistId: string, crisisData: any): Promise<string> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      userId,
      psychologistId,
      type: 'crisis_alert',
      title: '🚨 Alerta de Crisis Detectada',
      message: `Se han detectado señales de crisis en tu estado de ánimo. Tu psicólogo ha sido notificado.`,
      priority: 'critical',
      category: 'crisis',
      data: crisisData,
      actions: [
        {
          id: 'contact_psychologist',
          label: 'Contactar Psicólogo',
          action: 'contact_psychologist',
          style: 'primary',
        },
        {
          id: 'emergency_contact',
          label: 'Contacto de Emergencia',
          action: 'emergency_contact',
          style: 'danger',
        },
      ],
    };

    return this.createNotification(notification);
  }

  // Crear recordatorio de cita
  async createAppointmentReminder(
    userId: string,
    psychologistId: string,
    appointmentData: any,
    reminderMinutes: number = 30
  ): Promise<string> {
    const scheduledTime = new Date(appointmentData.startTime);
    scheduledTime.setMinutes(scheduledTime.getMinutes() - reminderMinutes);

    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      userId,
      psychologistId,
      type: 'appointment_reminder',
      title: '📅 Recordatorio de Cita',
      message: `Tienes una cita con tu psicólogo en ${reminderMinutes} minutos.`,
      priority: 'medium',
      category: 'appointment',
      data: appointmentData,
      scheduledFor: scheduledTime,
      actions: [
        {
          id: 'join_appointment',
          label: 'Unirse a la Cita',
          action: 'join_appointment',
          style: 'primary',
        },
        {
          id: 'reschedule',
          label: 'Reprogramar',
          action: 'reschedule',
          style: 'secondary',
        },
      ],
    };

    return this.createNotification(notification);
  }

  // Crear recordatorio de mood check
  async createMoodCheckReminder(userId: string, scheduledTime?: Date): Promise<string> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      userId,
      type: 'mood_check',
      title: '💭 ¿Cómo te sientes hoy?',
      message: 'Es hora de registrar tu estado de ánimo. Tómate un momento para reflexionar.',
      priority: 'low',
      category: 'health',
      scheduledFor: scheduledTime,
      actions: [
        {
          id: 'log_mood',
          label: 'Registrar Estado de Ánimo',
          action: 'log_mood',
          style: 'primary',
        },
        {
          id: 'remind_later',
          label: 'Recordar más tarde',
          action: 'remind_later',
          style: 'secondary',
        },
      ],
    };

    return this.createNotification(notification);
  }

  // Crear notificación de logro
  async createAchievementNotification(userId: string, achievement: any): Promise<string> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      userId,
      type: 'achievement',
      title: '🎉 ¡Logro Desbloqueado!',
      message: achievement.message,
      priority: 'medium',
      category: 'achievement',
      data: achievement,
      actions: [
        {
          id: 'view_achievement',
          label: 'Ver Detalles',
          action: 'view_achievement',
          style: 'primary',
        },
        {
          id: 'share_achievement',
          label: 'Compartir',
          action: 'share_achievement',
          style: 'secondary',
        },
      ],
    };

    return this.createNotification(notification);
  }

  // Crear notificación de recomendación
  async createRecommendationNotification(userId: string, recommendation: any): Promise<string> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      userId,
      type: 'recommendation',
      title: '💡 Nueva Recomendación',
      message: recommendation.message,
      priority: 'low',
      category: 'health',
      data: recommendation,
      actions: [
        {
          id: 'view_recommendation',
          label: 'Ver Recomendación',
          action: 'view_recommendation',
          style: 'primary',
        },
        {
          id: 'dismiss',
          label: 'Descartar',
          action: 'dismiss',
          style: 'secondary',
        },
      ],
    };

    return this.createNotification(notification);
  }

  // Programar notificaciones recurrentes
  async scheduleRecurringMoodChecks(
    userId: string,
    times: string[], // Array de horas en formato "HH:MM"
    timezone: string = 'UTC'
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Si la hora ya pasó hoy, programar para mañana
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const notificationId = await this.createMoodCheckReminder(userId, scheduledTime);
      notificationIds.push(notificationId);
    }

    return notificationIds;
  }

  // Limpiar notificaciones expiradas
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const expiredQuery = query(collection(db, 'notifications'), where('expiresAt', '<=', new Date()));

      const snapshot = await getDocs(expiredQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));

      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => doc.data()) as Notification[];

      const stats = {
        total: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      notifications.forEach((notification) => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // Limpiar listeners
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }
}

export const notificationService = new NotificationService();
