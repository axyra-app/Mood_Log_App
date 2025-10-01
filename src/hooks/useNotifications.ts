import { useCallback, useEffect, useState } from 'react';
import { Notification, notificationService } from '../services/notificationService';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationAction: (notificationId: string, actionId: string) => Promise<void>;
  createMoodCheckReminder: () => Promise<void>;
  createAchievementNotification: (achievement: any) => Promise<void>;
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } | null;
}

export const useNotifications = (userId: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseNotificationsReturn['stats']>(null);

  // Cargar notificaciones
  useEffect(() => {
    if (!userId) return;

    const unsubscribeNotifications = notificationService.subscribeToNotifications(
      userId,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
        setError(null);
      },
      50
    );

    const unsubscribeUnread = notificationService.subscribeToUnreadNotifications(userId, (count) => {
      setUnreadCount(count);
    });

    // Cargar estadísticas
    notificationService
      .getNotificationStats(userId)
      .then(setStats)
      .catch((err) => {
        console.error('Error loading notification stats:', err);
        setError('Error al cargar estadísticas de notificaciones');
      });

    return () => {
      unsubscribeNotifications();
      unsubscribeUnread();
    };
  }, [userId]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error al marcar notificación como leída');
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead(userId);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Error al marcar todas las notificaciones como leídas');
    }
  }, [userId]);

  // Manejar acciones de notificación
  const handleNotificationAction = useCallback(
    async (notificationId: string, actionId: string) => {
      try {
        const notification = notifications.find((n) => n.id === notificationId);
        if (!notification) return;

        const action = notification.actions?.find((a) => a.id === actionId);
        if (!action) return;

        // Marcar como leída primero
        await markAsRead(notificationId);

        // Manejar diferentes acciones
        switch (action.action) {
          case 'log_mood':
            // Redirigir al mood logging
            window.location.href = '/mood-flow';
            break;
          case 'contact_psychologist':
            // Abrir chat con psicólogo
            window.location.href = '/chat';
            break;
          case 'emergency_contact':
            // Mostrar contactos de emergencia
            alert('Contactos de emergencia:\n\nLínea Nacional de Prevención del Suicidio: 988\nCruz Roja: 065');
            break;
          case 'join_appointment':
            // Unirse a cita
            window.location.href = '/appointments';
            break;
          case 'view_achievement':
            // Ver logro
            console.log('Viewing achievement:', notification.data);
            break;
          case 'view_recommendation':
            // Ver recomendación
            console.log('Viewing recommendation:', notification.data);
            break;
          case 'dismiss':
            // Descartar notificación
            break;
          case 'remind_later':
            // Programar recordatorio para más tarde
            const laterTime = new Date();
            laterTime.setHours(laterTime.getHours() + 2);
            await notificationService.createMoodCheckReminder(userId, laterTime);
            break;
          default:
            console.log('Unknown action:', action.action);
        }
      } catch (err) {
        console.error('Error handling notification action:', err);
        setError('Error al procesar acción de notificación');
      }
    },
    [notifications, userId, markAsRead]
  );

  // Crear recordatorio de mood check
  const createMoodCheckReminder = useCallback(async () => {
    try {
      await notificationService.createMoodCheckReminder(userId);
    } catch (err) {
      console.error('Error creating mood check reminder:', err);
      setError('Error al crear recordatorio');
    }
  }, [userId]);

  // Crear notificación de logro
  const createAchievementNotification = useCallback(
    async (achievement: any) => {
      try {
        await notificationService.createAchievementNotification(userId, achievement);
      } catch (err) {
        console.error('Error creating achievement notification:', err);
        setError('Error al crear notificación de logro');
      }
    },
    [userId]
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
    createMoodCheckReminder,
    createAchievementNotification,
    stats,
  };
};
