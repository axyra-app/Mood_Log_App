import { useState, useEffect } from 'react';
import { 
  getUserNotifications, 
  getPsychologistNotifications,
  markNotificationAsRead, 
  Notification 
} from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useUserNotifications = (userId: string) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Usar la función correcta según el rol del usuario
    const getNotificationsFunction = user?.role === 'psychologist' 
      ? getPsychologistNotifications 
      : getUserNotifications;

    const unsubscribe = getNotificationsFunction(userId, (notificationsData) => {
      setNotifications(notificationsData);
      
      // Contar notificaciones no leídas
      const unread = notificationsData.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, user?.role]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
