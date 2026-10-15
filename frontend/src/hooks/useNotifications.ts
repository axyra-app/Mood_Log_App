import {
  addDoc,
  collection,
  deleteDoc,
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
import { useAuth } from '../contexts/AuthContext';
import { firebaseConnectionManager } from '../services/firebaseConnectionManager';

export interface Notification {
  id: string;
  userId: string;
  type: 'profile_incomplete' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

export const useNotifications = (userId: string) => {
  const { user, profileLoaded } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !user || !profileLoaded) {
      setLoading(false);
      return;
    }


    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const listenerKey = `notifications-${userId}`;
    
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        try {
          const notificationsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            const type: Notification['type'] =
              data.type === 'profile_incomplete' ? 'profile_incomplete' : 'general';
            return {
              id: doc.id,
              userId: data.userId,
              type,
              title: data.title,
              message: data.message,
              isRead: data.isRead || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              data: data.data,
            };
          });

          // Verificar si el usuario necesita completar perfil
          // Solo crear notificación si el usuario está completamente cargado y le faltan datos
          // Verificar displayName y username (campos requeridos en CompleteProfile)
          const needsProfileCompletion = user && (!user.displayName || !user.username);
          
          // Crear notificación de perfil incompleto si es necesario
          const profileNotification = needsProfileCompletion ? {
            id: 'profile-incomplete',
            userId: userId,
            type: 'profile_incomplete' as const,
            title: 'Perfil Incompleto',
            message: 'Necesitas completar tu perfil para acceder a todas las funcionalidades',
            isRead: false,
            createdAt: new Date(),
            data: null,
          } : null;

          // Combinar notificaciones
          const allNotifications = [
            ...(profileNotification ? [profileNotification] : []),
            ...notificationsData
          ];

          setNotifications(allNotifications);
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
        firebaseConnectionManager.handleConnectionError(listenerKey, err, () => {
          // Retry logic handled by connection manager
        });
        setError('Error en la conexión de notificaciones');
        setLoading(false);
      }
    );

    // Registrar el listener en el gestor de conexiones
    firebaseConnectionManager.registerListener(listenerKey, unsubscribe);

    return () => {
      firebaseConnectionManager.unregisterListener(listenerKey);
    };
  }, [userId, user, profileLoaded]);

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

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
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
    deleteNotification,
    createNotification,
  };
};
