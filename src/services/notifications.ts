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
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'reminder' | 'error' | 'system';
  read: boolean;
  createdAt: any;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: any;
  category: 'mood' | 'achievement' | 'reminder' | 'system' | 'social' | 'wellness';
  actionUrl?: string;
  actionText?: string;
}

// Crear una notificación con mejor manejo de errores
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');

    // Validar datos requeridos
    if (!notification.userId || !notification.title || !notification.message) {
      throw new Error('Datos de notificación incompletos');
    }

    // Agregar valores por defecto si no están presentes
    const notificationData = {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
      priority: notification.priority || 'medium',
      category: notification.category || 'system',
    };

    const docRef = await addDoc(notificationsRef, notificationData);

    // Intentar notificación push si está disponible
    try {
      await sendPushNotification(notification);
    } catch (pushError) {
      console.warn('Push notification failed:', pushError);
      // No fallar la creación de notificación si push falla
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);

    // Fallback: guardar en localStorage si Firestore falla
    try {
      const fallbackNotification = {
        id: `fallback_${Date.now()}`,
        ...notification,
        read: false,
        createdAt: new Date().toISOString(),
        priority: notification.priority || 'medium',
        category: notification.category || 'system',
      };

      const existingNotifications = JSON.parse(localStorage.getItem('fallback_notifications') || '[]');
      existingNotifications.push(fallbackNotification);
      localStorage.setItem('fallback_notifications', JSON.stringify(existingNotifications));

      return fallbackNotification.id;
    } catch (fallbackError) {
      console.error('Fallback notification failed:', fallbackError);
      throw error;
    }
  }
};

// Función para enviar notificaciones push
const sendPushNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notificationOptions = {
      body: notification.message,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notification.category,
      data: notification.data,
      actions: notification.actionText
        ? [
            {
              action: 'view',
              title: notification.actionText,
              icon: '/pwa-192x192.png',
            },
          ]
        : undefined,
    };

    new Notification(notification.title, notificationOptions);
  } catch (error) {
    console.warn('Error sending push notification:', error);
  }
};

// Solicitar permisos de notificación
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Permisos de notificación denegados');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Obtener notificaciones de un usuario con fallback
export const getUserNotifications = async (userId: string, limitCount: number = 10): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const firestoreNotifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];

    // Obtener notificaciones de fallback del localStorage
    const fallbackNotifications = JSON.parse(localStorage.getItem('fallback_notifications') || '[]')
      .filter((n: any) => n.userId === userId)
      .slice(0, limitCount - firestoreNotifications.length);

    // Combinar notificaciones de Firestore y fallback
    const allNotifications = [...firestoreNotifications, ...fallbackNotifications]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
        const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limitCount);

    return allNotifications;
  } catch (error) {
    console.error('Error getting notifications:', error);

    // Fallback: solo notificaciones del localStorage
    try {
      const fallbackNotifications = JSON.parse(localStorage.getItem('fallback_notifications') || '[]')
        .filter((n: any) => n.userId === userId)
        .slice(0, limitCount);
      return fallbackNotifications;
    } catch (fallbackError) {
      console.error('Fallback notifications failed:', fallbackError);
      return [];
    }
  }
};

// Marcar notificación como leída
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

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notifications = await getUserNotifications(userId, 100);
    const unreadNotifications = notifications.filter((n) => !n.read);

    const updatePromises = unreadNotifications.map((notification) => markNotificationAsRead(notification.id!));

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Escuchar notificaciones en tiempo real
export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));

  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    callback(notifications);
  });
};

// Crear notificaciones automáticas
export const createWelcomeNotification = async (userId: string, username: string): Promise<void> => {
  await createNotification({
    userId,
    title: '¡Bienvenido!',
    message: `¡Hola ${username}! Comienza registrando tu primer estado de ánimo para obtener análisis personalizados con IA.`,
    type: 'info',
  });
};

export const createMoodLogNotification = async (userId: string, mood: number): Promise<void> => {
  const moodMessages = [
    'Has registrado un estado de ánimo bajo. ¿Te gustaría recibir algunos consejos?',
    'Has registrado un estado de ánimo regular. ¡Sigue registrando para ver patrones!',
    'Has registrado un estado de ánimo positivo. ¡Excelente!',
    'Has registrado un estado de ánimo muy positivo. ¡Fantástico!',
  ];

  await createNotification({
    userId,
    title: 'Mood registrado',
    message: moodMessages[mood - 1] || 'Gracias por registrar tu estado de ánimo.',
    type: 'success',
  });
};

export const createAchievementNotification = async (
  userId: string,
  achievement: string,
  count: number
): Promise<void> => {
  await createNotification({
    userId,
    title: '¡Hito alcanzado!',
    message: `Has registrado ${count} estados de ánimo. ¡Sigue así!`,
    type: 'achievement',
    data: { achievement, count },
  });
};

export const createReminderNotification = async (userId: string): Promise<void> => {
  await createNotification({
    userId,
    title: 'Recordatorio',
    message: 'No olvides registrar cómo te sientes hoy. Tu bienestar emocional es importante.',
    type: 'reminder',
    priority: 'medium',
    category: 'reminder',
  });
};

// Limpiar notificaciones antiguas
export const cleanupOldNotifications = async (userId: string, daysOld: number = 30): Promise<void> => {
  try {
    const notifications = await getUserNotifications(userId, 1000);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldNotifications = notifications.filter((notification) => {
      const notificationDate = new Date(
        notification.createdAt?.seconds ? notification.createdAt.seconds * 1000 : notification.createdAt
      );
      return notificationDate < cutoffDate;
    });

    if (oldNotifications.length > 0) {
      const batch = writeBatch(db);

      oldNotifications.forEach((notification) => {
        if (notification.id && !notification.id.startsWith('fallback_')) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.delete(notificationRef);
        }
      });

      await batch.commit();
    }

    // Limpiar también del localStorage
    const fallbackNotifications = JSON.parse(localStorage.getItem('fallback_notifications') || '[]').filter(
      (n: any) => {
        if (n.userId !== userId) return true;
        const notificationDate = new Date(n.createdAt);
        return notificationDate >= cutoffDate;
      }
    );

    localStorage.setItem('fallback_notifications', JSON.stringify(fallbackNotifications));
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (
  userId: string
): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}> => {
  try {
    const notifications = await getUserNotifications(userId, 1000);

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    notifications.forEach((notification) => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {
      total: 0,
      unread: 0,
      byType: {},
      byCategory: {},
    };
  }
};

// Crear notificaciones inteligentes basadas en patrones
export const createIntelligentNotification = async (
  userId: string,
  moodHistory: any[],
  userPreferences: any
): Promise<void> => {
  try {
    // Analizar patrones del usuario
    const recentMoods = moodHistory.slice(0, 7);
    const averageMood = recentMoods.reduce((sum, mood) => sum + mood.mood, 0) / recentMoods.length;
    const lastMoodDate = recentMoods[0]?.createdAt;
    const daysSinceLastMood = lastMoodDate
      ? Math.floor((Date.now() - new Date(lastMoodDate.seconds * 1000).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let notification;

    if (daysSinceLastMood >= 2) {
      // Recordatorio si no ha registrado mood en 2+ días
      notification = {
        userId,
        title: '¿Cómo te sientes?',
        message: 'Hace un tiempo que no registras tu estado de ánimo. ¿Te gustaría compartir cómo te sientes hoy?',
        type: 'reminder' as const,
        priority: 'high' as const,
        category: 'mood' as const,
        actionText: 'Registrar Mood',
        actionUrl: '/mood-flow',
      };
    } else if (averageMood <= 2) {
      // Apoyo si el mood promedio es bajo
      notification = {
        userId,
        title: 'Estamos aquí para ti',
        message:
          'Notamos que has tenido algunos días difíciles. Recuerda que es normal sentirse así y que puedes superarlo.',
        type: 'info' as const,
        priority: 'high' as const,
        category: 'wellness' as const,
        actionText: 'Ver Consejos',
        actionUrl: '/chat',
      };
    } else if (averageMood >= 4) {
      // Celebración si el mood es alto
      notification = {
        userId,
        title: '¡Excelente!',
        message: 'Has mantenido un estado de ánimo muy positivo. ¡Sigue así!',
        type: 'achievement' as const,
        priority: 'medium' as const,
        category: 'achievement' as const,
      };
    } else {
      // Notificación general de bienestar
      notification = {
        userId,
        title: 'Mantén el equilibrio',
        message: 'Tu bienestar emocional es importante. Continúa monitoreando tus emociones.',
        type: 'info' as const,
        priority: 'low' as const,
        category: 'wellness' as const,
      };
    }

    await createNotification(notification);
  } catch (error) {
    console.error('Error creating intelligent notification:', error);
  }
};
