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
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'reminder';
  read: boolean;
  createdAt: any;
  data?: any;
}

// Crear una notificación
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Obtener notificaciones de un usuario
export const getUserNotifications = async (userId: string, limitCount: number = 10): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
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
  });
};
