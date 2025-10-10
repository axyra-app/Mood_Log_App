import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'message' | 'crisis' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery,
      (snapshot) => {
        try {
          const notificationsData: Notification[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              type: data.type,
              title: data.title,
              message: data.message,
              isRead: data.isRead,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              data: data.data,
            };
          });
          
          setNotifications(notificationsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching notifications:', err);
          setError('Error al cargar las notificaciones');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in notifications listener:', err);
        setError('Error en la conexión de notificaciones');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications.map(notification => 
        markAsRead(notification.id)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const notificationData = {
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: serverTimestamp(),
        data: data || null,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    getUnreadCount,
  };
};

// Hook específico para notificaciones de psicólogos
export const usePsychologistNotifications = (psychologistId: string) => {
  const { notifications, loading, error, markAsRead, markAllAsRead, createNotification, getUnreadCount } = useNotifications(psychologistId);

  const createAppointmentNotification = async (
    userId: string,
    appointmentData: any
  ) => {
    return createNotification(
      psychologistId,
      'appointment',
      'Nueva Cita Solicitada',
      `El usuario ${appointmentData.userName} ha solicitado una cita para ${appointmentData.date}`,
      appointmentData
    );
  };

  const createCrisisNotification = async (
    userId: string,
    crisisData: any
  ) => {
    return createNotification(
      psychologistId,
      'crisis',
      'Alerta de Crisis',
      `El usuario ${crisisData.userName} muestra señales de crisis`,
      crisisData
    );
  };

  const createMessageNotification = async (
    userId: string,
    messageData: any
  ) => {
    return createNotification(
      psychologistId,
      'message',
      'Nuevo Mensaje',
      `Mensaje de ${messageData.userName}`,
      messageData
    );
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    getUnreadCount,
    createAppointmentNotification,
    createCrisisNotification,
    createMessageNotification,
  };
};