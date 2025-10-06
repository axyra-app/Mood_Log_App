import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications';

export interface Reminder {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'mood' | 'wellness' | 'achievement' | 'custom';
  frequency: 'daily' | 'weekly' | 'custom';
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  createdAt: any;
  lastTriggered?: any;
  nextTrigger?: any;
  data?: any;
}

export interface ReminderSettings {
  userId: string;
  moodReminders: {
    enabled: boolean;
    times: string[];
    days: number[];
  };
  wellnessReminders: {
    enabled: boolean;
    times: string[];
    days: number[];
  };
  achievementReminders: {
    enabled: boolean;
    times: string[];
    days: number[];
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  timezone: string;
}

// Crear un recordatorio
export const createReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const remindersRef = collection(db, 'reminders');
    const nextTrigger = calculateNextTrigger(reminder);

    const reminderData = {
      ...reminder,
      createdAt: serverTimestamp(),
      nextTrigger: nextTrigger,
    };

    const docRef = await addDoc(remindersRef, reminderData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

// Obtener recordatorios de un usuario
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    const remindersRef = collection(db, 'reminders');
    const q = query(remindersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reminder[];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};

// Actualizar un recordatorio
export const updateReminder = async (reminderId: string, updates: Partial<Reminder>): Promise<void> => {
  try {
    const reminderRef = doc(db, 'reminders', reminderId);

    // Recalcular nextTrigger si se actualizó la frecuencia o tiempo
    if (updates.frequency || updates.time || updates.days) {
      const currentReminder = await getReminderById(reminderId);
      if (currentReminder) {
        updates.nextTrigger = calculateNextTrigger({ ...currentReminder, ...updates });
      }
    }

    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

// Eliminar un recordatorio
export const deleteReminder = async (reminderId: string): Promise<void> => {
  try {
    const reminderRef = doc(db, 'reminders', reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

// Obtener un recordatorio por ID
export const getReminderById = async (reminderId: string): Promise<Reminder | null> => {
  try {
    const reminderRef = doc(db, 'reminders', reminderId);
    const reminderDoc = await getDocs(query(collection(db, 'reminders'), where('__name__', '==', reminderId)));

    if (reminderDoc.empty) return null;

    return {
      id: reminderDoc.docs[0].id,
      ...reminderDoc.docs[0].data(),
    } as Reminder;
  } catch (error) {
    console.error('Error getting reminder by ID:', error);
    return null;
  }
};

// Calcular el próximo trigger de un recordatorio
const calculateNextTrigger = (reminder: Reminder): Date => {
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);

  let nextTrigger = new Date();
  nextTrigger.setHours(hours, minutes, 0, 0);

  // Si el tiempo ya pasó hoy, programar para mañana
  if (nextTrigger <= now) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }

  // Encontrar el próximo día válido
  while (!reminder.days.includes(nextTrigger.getDay())) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }

  return nextTrigger;
};

// Verificar recordatorios que deben ejecutarse
export const checkAndTriggerReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    const remindersRef = collection(db, 'reminders');

    // Obtener recordatorios que deben ejecutarse
    const q = query(remindersRef, where('enabled', '==', true), where('nextTrigger', '<=', now));

    const querySnapshot = await getDocs(q);

    for (const reminderDoc of querySnapshot.docs) {
      const reminder = { id: reminderDoc.id, ...reminderDoc.data() } as Reminder;

      try {
        await triggerReminder(reminder);

        // Actualizar el próximo trigger
        const nextTrigger = calculateNextTrigger(reminder);
        await updateReminder(reminder.id!, {
          lastTriggered: serverTimestamp(),
          nextTrigger: nextTrigger,
        });
      } catch (error) {
        console.error(`Error triggering reminder ${reminder.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Ejecutar un recordatorio
const triggerReminder = async (reminder: Reminder): Promise<void> => {
  try {
    // Crear notificación
    await createNotification({
      userId: reminder.userId,
      title: reminder.title,
      message: reminder.message,
      type: 'reminder',
      priority: 'medium',
      category: 'reminder',
      data: reminder.data,
    });

    // Ejecutar acciones específicas según el tipo
    switch (reminder.type) {
      case 'mood':
        await triggerMoodReminder(reminder);
        break;
      case 'wellness':
        await triggerWellnessReminder(reminder);
        break;
      case 'achievement':
        await triggerAchievementReminder(reminder);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Error triggering reminder:', error);
  }
};

// Recordatorio específico para mood
const triggerMoodReminder = async (reminder: Reminder): Promise<void> => {
  // Verificar si ya registró mood hoy
  const today = new Date().toDateString();
  const moodLogsRef = collection(db, 'moodLogs');
  const todayQuery = query(
    moodLogsRef,
    where('userId', '==', reminder.userId),
    where('createdAt', '>=', new Date(today)),
    limit(1)
  );

  const todayMood = await getDocs(todayQuery);

  if (todayMood.empty) {
    // No ha registrado mood hoy, enviar recordatorio
    await createNotification({
      userId: reminder.userId,
      title: '¿Cómo te sientes hoy?',
      message: 'Es hora de registrar tu estado de ánimo. ¿Te gustaría compartir cómo te sientes?',
      type: 'reminder',
      priority: 'high',
      category: 'mood',
      actionText: 'Registrar Mood',
      actionUrl: '/mood-flow',
    });
  }
};

// Recordatorio específico para bienestar
const triggerWellnessReminder = async (reminder: Reminder): Promise<void> => {
  // Enviar consejo de bienestar personalizado
  const wellnessTips = [
    'Recuerda tomar agua y mantenerte hidratado',
    '¿Has hecho ejercicio hoy? Una caminata corta puede mejorar tu estado de ánimo',
    'Dedica 5 minutos a la respiración profunda para reducir el estrés',
    'Conecta con alguien que aprecies, las relaciones sociales son importantes',
    'Practica gratitud: piensa en 3 cosas buenas que te hayan pasado hoy',
  ];

  const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];

  await createNotification({
    userId: reminder.userId,
    title: 'Consejo de Bienestar',
    message: randomTip,
    type: 'info',
    priority: 'low',
    category: 'wellness',
  });
};

// Recordatorio específico para logros
const triggerAchievementReminder = async (reminder: Reminder): Promise<void> => {
  // Verificar logros recientes
  const moodLogsRef = collection(db, 'moodLogs');
  const recentQuery = query(
    moodLogsRef,
    where('userId', '==', reminder.userId),
    orderBy('createdAt', 'desc'),
    limit(7)
  );

  const recentMoods = await getDocs(recentQuery);

  if (recentMoods.size >= 7) {
    await createNotification({
      userId: reminder.userId,
      title: '¡Excelente progreso!',
      message: 'Has registrado tu estado de ánimo durante 7 días seguidos. ¡Sigue así!',
      type: 'achievement',
      priority: 'medium',
      category: 'achievement',
    });
  }
};

// Crear recordatorios por defecto para un usuario nuevo
export const createDefaultReminders = async (userId: string): Promise<void> => {
  try {
    const defaultReminders = [
      {
        userId,
        title: 'Registro de Estado de Ánimo',
        message: 'Es hora de registrar cómo te sientes hoy',
        type: 'mood' as const,
        frequency: 'daily' as const,
        time: '09:00',
        days: [1, 2, 3, 4, 5], // Lunes a Viernes
        enabled: true,
      },
      {
        userId,
        title: 'Consejo de Bienestar',
        message: 'Recuerda cuidar tu bienestar emocional',
        type: 'wellness' as const,
        frequency: 'daily' as const,
        time: '18:00',
        days: [1, 2, 3, 4, 5, 6, 0], // Todos los días
        enabled: true,
      },
      {
        userId,
        title: 'Revisión Semanal',
        message: 'Revisa tu progreso semanal y establece metas',
        type: 'achievement' as const,
        frequency: 'weekly' as const,
        time: '10:00',
        days: [0], // Domingo
        enabled: true,
      },
    ];

    for (const reminder of defaultReminders) {
      await createReminder(reminder);
    }
  } catch (error) {
    console.error('Error creating default reminders:', error);
  }
};

// Obtener configuración de recordatorios
export const getReminderSettings = async (userId: string): Promise<ReminderSettings | null> => {
  try {
    const settingsRef = collection(db, 'reminderSettings');
    const q = query(settingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Crear configuración por defecto
      const defaultSettings: ReminderSettings = {
        userId,
        moodReminders: {
          enabled: true,
          times: ['09:00', '18:00'],
          days: [1, 2, 3, 4, 5],
        },
        wellnessReminders: {
          enabled: true,
          times: ['12:00'],
          days: [1, 2, 3, 4, 5, 6, 0],
        },
        achievementReminders: {
          enabled: true,
          times: ['10:00'],
          days: [0],
        },
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await createReminderSettings(defaultSettings);
      return defaultSettings;
    }

    return querySnapshot.docs[0].data() as ReminderSettings;
  } catch (error) {
    console.error('Error getting reminder settings:', error);
    return null;
  }
};

// Crear configuración de recordatorios
export const createReminderSettings = async (settings: ReminderSettings): Promise<void> => {
  try {
    const settingsRef = collection(db, 'reminderSettings');
    await addDoc(settingsRef, {
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating reminder settings:', error);
    throw error;
  }
};

// Actualizar configuración de recordatorios
export const updateReminderSettings = async (userId: string, updates: Partial<ReminderSettings>): Promise<void> => {
  try {
    const settingsRef = collection(db, 'reminderSettings');
    const q = query(settingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(db, 'reminderSettings', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    throw error;
  }
};

// Inicializar el sistema de recordatorios
export const initializeReminderSystem = async (userId: string): Promise<void> => {
  try {
    // Crear recordatorios por defecto
    await createDefaultReminders(userId);

    // Crear configuración por defecto
    await getReminderSettings(userId);

    console.log('Reminder system initialized for user:', userId);
  } catch (error) {
    console.error('Error initializing reminder system:', error);
  }
};
