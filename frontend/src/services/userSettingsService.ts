import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface UserSettings {
  userId: string;
  // Configuración de notificaciones
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    moodReminders: boolean;
    appointmentReminders: boolean;
    achievementNotifications: boolean;
    crisisAlerts: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
  };
  // Configuración de privacidad
  privacy: {
    profileVisibility: 'public' | 'private' | 'psychologists-only';
    dataSharing: boolean;
    analyticsOptIn: boolean;
    marketingEmails: boolean;
  };
  // Configuración de la aplicación
  app: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
  };
  // Configuración de mood logging
  moodLogging: {
    reminderTimes: string[]; // Array de horas en formato "HH:MM"
    defaultMoodScale: 5 | 10;
    enableDetailedLogging: boolean;
    autoSave: boolean;
  };
  // Configuración de psicólogo (solo para psicólogos)
  psychologist?: {
    availability: {
      monday: { start: string; end: string; available: boolean };
      tuesday: { start: string; end: string; available: boolean };
      wednesday: { start: string; end: string; available: boolean };
      thursday: { start: string; end: string; available: boolean };
      friday: { start: string; end: string; available: boolean };
      saturday: { start: string; end: string; available: boolean };
      sunday: { start: string; end: string; available: boolean };
    };
    sessionDuration: number; // en minutos
    maxPatientsPerDay: number;
    emergencyContact: string;
    autoAcceptAppointments: boolean;
  };
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  version: number; // Para migraciones futuras
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    moodReminders: true,
    appointmentReminders: true,
    achievementNotifications: true,
    crisisAlerts: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analyticsOptIn: true,
    marketingEmails: false,
  },
  app: {
    theme: 'auto',
    language: 'es',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  moodLogging: {
    reminderTimes: ['09:00', '15:00', '21:00'],
    defaultMoodScale: 5,
    enableDetailedLogging: true,
    autoSave: true,
  },
  version: 1,
};

class UserSettingsService {
  // Obtener configuración del usuario
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', userId));

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserSettings;
      } else {
        // Crear configuración por defecto
        return await this.createDefaultSettings(userId);
      }
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Crear configuración por defecto
  async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const defaultSettings: UserSettings = {
        userId,
        ...DEFAULT_USER_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'userSettings', userId), {
        ...defaultSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return defaultSettings;
    } catch (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }
  }

  // Actualizar configuración del usuario
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de notificaciones
  async updateNotificationSettings(
    userId: string,
    notificationUpdates: Partial<UserSettings['notifications']>
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        notifications: notificationUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de privacidad
  async updatePrivacySettings(userId: string, privacyUpdates: Partial<UserSettings['privacy']>): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        privacy: privacyUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de la aplicación
  async updateAppSettings(userId: string, appUpdates: Partial<UserSettings['app']>): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        app: appUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de mood logging
  async updateMoodLoggingSettings(
    userId: string,
    moodLoggingUpdates: Partial<UserSettings['moodLogging']>
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        moodLogging: moodLoggingUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating mood logging settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de psicólogo
  async updatePsychologistSettings(
    userId: string,
    psychologistUpdates: Partial<UserSettings['psychologist']>
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await updateDoc(settingsRef, {
        psychologist: psychologistUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating psychologist settings:', error);
      throw error;
    }
  }

  // Resetear configuración a valores por defecto
  async resetToDefaults(userId: string): Promise<void> {
    try {
      const defaultSettings = {
        ...DEFAULT_USER_SETTINGS,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'userSettings', userId), defaultSettings, { merge: true });
    } catch (error) {
      console.error('Error resetting settings to defaults:', error);
      throw error;
    }
  }

  // Exportar configuración del usuario
  async exportSettings(userId: string): Promise<UserSettings> {
    return this.getUserSettings(userId);
  }

  // Importar configuración del usuario
  async importSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'userSettings', userId);

      await setDoc(
        settingsRef,
        {
          ...settings,
          userId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }

  // Validar configuración
  validateSettings(settings: Partial<UserSettings>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar horas de recordatorio
    if (settings.moodLogging?.reminderTimes) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      for (const time of settings.moodLogging.reminderTimes) {
        if (!timeRegex.test(time)) {
          errors.push(`Hora de recordatorio inválida: ${time}`);
        }
      }
    }

    // Validar horas de disponibilidad del psicólogo
    if (settings.psychologist?.availability) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      for (const day of days) {
        const dayAvailability =
          settings.psychologist.availability[day as keyof typeof settings.psychologist.availability];
        if (dayAvailability) {
          if (!timeRegex.test(dayAvailability.start) || !timeRegex.test(dayAvailability.end)) {
            errors.push(`Horas de disponibilidad inválidas para ${day}`);
          }
        }
      }
    }

    // Validar zona horaria
    if (settings.app?.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: settings.app.timezone });
      } catch {
        errors.push('Zona horaria inválida');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const userSettingsService = new UserSettingsService();



