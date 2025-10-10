import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface Notification {
  id: string;
  userId: string;
  psychologistId?: string;
  type: 'chat_message' | 'appointment_request' | 'appointment_accepted' | 'appointment_rejected' | 'medical_report';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

export const useNotifications = (userId: string, userRole: 'user' | 'psychologist') => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Query diferente según el rol del usuario
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where(userRole === 'user' ? 'userId' : 'psychologistId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        try {
          const notificationsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              psychologistId: data.psychologistId,
              type: data.type,
              title: data.title,
              message: data.message,
              isRead: data.isRead || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              data: data.data,
            };
          });

          setNotifications(notificationsData);
          setError(null);
        } catch (err) {
          console.error('Error processing notifications:', err);
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
  }, [userId, userRole]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      const updatePromises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: serverTimestamp(),
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
        isRead: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
};

// Función para crear notificación cuando un paciente escribe
export const createChatNotification = async (
  psychologistId: string,
  userId: string,
  userName: string,
  message: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId: psychologistId, // El psicólogo recibe la notificación
      psychologistId: psychologistId,
      type: 'chat_message',
      title: 'Nuevo mensaje de paciente',
      message: `${userName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      isRead: false,
      createdAt: serverTimestamp(),
      data: {
        userId,
        userName,
        message,
        chatType: 'patient_message',
      },
    });
  } catch (error) {
    console.error('Error creating chat notification:', error);
  }
};

// Función para crear notificación cuando un psicólogo escribe
export const createPsychologistChatNotification = async (
  userId: string,
  psychologistId: string,
  psychologistName: string,
  message: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId: userId, // El usuario recibe la notificación
      psychologistId: psychologistId,
      type: 'chat_message',
      title: 'Nuevo mensaje del psicólogo',
      message: `${psychologistName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      isRead: false,
      createdAt: serverTimestamp(),
      data: {
        psychologistId,
        psychologistName,
        message,
        chatType: 'psychologist_message',
      },
    });
  } catch (error) {
    console.error('Error creating psychologist chat notification:', error);
  }
};
