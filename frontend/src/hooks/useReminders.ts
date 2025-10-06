import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createReminder,
  deleteReminder,
  getReminderSettings,
  getUserReminders,
  initializeReminderSystem,
  updateReminder,
  updateReminderSettings,
  type Reminder,
  type ReminderSettings,
} from '../services/reminderService';

export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar recordatorios del usuario
  const loadReminders = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const userReminders = await getUserReminders(user.uid);
      setReminders(userReminders);
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError('Error al cargar los recordatorios');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Cargar configuración de recordatorios
  const loadSettings = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const reminderSettings = await getReminderSettings(user.uid);
      setSettings(reminderSettings);
    } catch (err) {
      console.error('Error loading reminder settings:', err);
    }
  }, [user?.uid]);

  // Crear un nuevo recordatorio
  const addReminder = useCallback(
    async (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'userId'>) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        const newReminder = {
          ...reminderData,
          userId: user.uid,
        };

        const reminderId = await createReminder(newReminder);

        // Actualizar la lista local
        setReminders((prev) => [...prev, { ...newReminder, id: reminderId }]);

        return reminderId;
      } catch (err) {
        console.error('Error creating reminder:', err);
        setError('Error al crear el recordatorio');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  // Actualizar un recordatorio
  const editReminder = useCallback(async (reminderId: string, updates: Partial<Reminder>) => {
    try {
      setLoading(true);
      setError(null);

      await updateReminder(reminderId, updates);

      // Actualizar la lista local
      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === reminderId ? { ...reminder, ...updates } : reminder))
      );
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError('Error al actualizar el recordatorio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar un recordatorio
  const removeReminder = useCallback(async (reminderId: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteReminder(reminderId);

      // Actualizar la lista local
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Error al eliminar el recordatorio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar configuración de recordatorios
  const updateSettings = useCallback(
    async (updates: Partial<ReminderSettings>) => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        await updateReminderSettings(user.uid, updates);

        // Actualizar configuración local
        setSettings((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (err) {
        console.error('Error updating reminder settings:', err);
        setError('Error al actualizar la configuración');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  // Inicializar sistema de recordatorios
  const initializeReminders = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await initializeReminderSystem(user.uid);
      await loadReminders();
      await loadSettings();
    } catch (err) {
      console.error('Error initializing reminders:', err);
      setError('Error al inicializar los recordatorios');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadReminders, loadSettings]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.uid) {
      loadReminders();
      loadSettings();
    }
  }, [user?.uid, loadReminders, loadSettings]);

  // Obtener recordatorios por tipo
  const getRemindersByType = useCallback(
    (type: Reminder['type']) => {
      return reminders.filter((reminder) => reminder.type === type);
    },
    [reminders]
  );

  // Obtener recordatorios activos
  const getActiveReminders = useCallback(() => {
    return reminders.filter((reminder) => reminder.enabled);
  }, [reminders]);

  // Obtener recordatorios por día de la semana
  const getRemindersForDay = useCallback(
    (dayOfWeek: number) => {
      return reminders.filter((reminder) => reminder.enabled && reminder.days.includes(dayOfWeek));
    },
    [reminders]
  );

  // Verificar si hay recordatorios para hoy
  const hasRemindersForToday = useCallback(() => {
    const today = new Date().getDay();
    return getRemindersForDay(today).length > 0;
  }, [getRemindersForDay]);

  // Obtener próximos recordatorios
  const getUpcomingReminders = useCallback(
    (limit: number = 5) => {
      const now = new Date();
      return reminders
        .filter((reminder) => reminder.enabled && reminder.nextTrigger)
        .sort((a, b) => {
          const dateA = new Date(a.nextTrigger);
          const dateB = new Date(b.nextTrigger);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, limit);
    },
    [reminders]
  );

  return {
    reminders,
    settings,
    loading,
    error,
    loadReminders,
    loadSettings,
    addReminder,
    editReminder,
    removeReminder,
    updateSettings,
    initializeReminders,
    getRemindersByType,
    getActiveReminders,
    getRemindersForDay,
    hasRemindersForToday,
    getUpcomingReminders,
  };
};
