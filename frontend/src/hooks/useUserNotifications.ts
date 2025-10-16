import { useState, useEffect } from 'react';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  Notification 
} from '../services/notificationService';

export const useUserNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('🔔 useUserNotifications: Iniciando listener para usuario:', userId);

    const unsubscribe = getUserNotifications(userId, (notificationsData) => {
      console.log('🔔 useUserNotifications: Notificaciones recibidas:', notificationsData);
      
      setNotifications(notificationsData);
      
      // Contar notificaciones no leídas
      const unread = notificationsData.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
      
      console.log('🔔 useUserNotifications: Notificaciones no leídas:', unread);
      
      setLoading(false);
    });

    return () => {
      console.log('🔔 useUserNotifications: Limpiando listener');
      unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      console.log('✅ Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
      console.log('✅ Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error);
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
