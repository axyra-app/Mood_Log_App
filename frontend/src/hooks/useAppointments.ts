import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Appointment, 
  AppointmentNotification,
  createAppointment,
  acceptAppointment,
  rejectAppointment,
  getUserAppointments,
  getPsychologistNotifications,
  markNotificationAsRead,
  subscribeToPsychologistNotifications
} from '../services/appointmentService';

export const useAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user appointments
  const loadAppointments = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const appointmentsData = await getUserAppointments(user.uid);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Create new appointment
  const createNewAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      const appointmentId = await createAppointment({
        ...appointmentData,
        userId: user.uid,
      });
      await loadAppointments();
      return appointmentId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    createAppointment: createNewAppointment,
    refreshAppointments: loadAppointments,
  };
};

export const usePsychologistNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load psychologist notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const notificationsData = await getPsychologistNotifications(user.uid);
      setNotifications(notificationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Accept appointment
  const acceptAppointmentNotification = useCallback(async (appointmentId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      await acceptAppointment(appointmentId, user.uid);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accepting appointment');
      throw err;
    }
  }, [user?.uid, loadNotifications]);

  // Reject appointment
  const rejectAppointmentNotification = useCallback(async (appointmentId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      await rejectAppointment(appointmentId, user.uid);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting appointment');
      throw err;
    }
  }, [user?.uid, loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [loadNotifications]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeToPsychologistNotifications(user.uid, (notificationsData) => {
      setNotifications(notificationsData);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    acceptAppointment: acceptAppointmentNotification,
    rejectAppointment: rejectAppointmentNotification,
    markAsRead,
    refreshNotifications: loadNotifications,
  };
};
