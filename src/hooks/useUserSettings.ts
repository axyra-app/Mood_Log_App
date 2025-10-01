import { useCallback, useEffect, useState } from 'react';
import { UserSettings, userSettingsService } from '../services/userSettingsService';

interface UseUserSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  updateNotificationSettings: (updates: Partial<UserSettings['notifications']>) => Promise<void>;
  updatePrivacySettings: (updates: Partial<UserSettings['privacy']>) => Promise<void>;
  updateAppSettings: (updates: Partial<UserSettings['app']>) => Promise<void>;
  updateMoodLoggingSettings: (updates: Partial<UserSettings['moodLogging']>) => Promise<void>;
  updatePsychologistSettings: (updates: Partial<UserSettings['psychologist']>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportSettings: () => Promise<UserSettings>;
  importSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useUserSettings = (userId: string): UseUserSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración del usuario
  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userSettings = await userSettingsService.getUserSettings(userId);
        setSettings(userSettings);
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError('Error al cargar configuración del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  // Actualizar configuración general
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updateUserSettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null));
      } catch (err) {
        console.error('Error updating user settings:', err);
        setError('Error al actualizar configuración');
        throw err;
      }
    },
    [userId]
  );

  // Actualizar configuración de notificaciones
  const updateNotificationSettings = useCallback(
    async (updates: Partial<UserSettings['notifications']>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updateNotificationSettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                notifications: { ...prev.notifications, ...updates },
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error updating notification settings:', err);
        setError('Error al actualizar configuración de notificaciones');
        throw err;
      }
    },
    [userId]
  );

  // Actualizar configuración de privacidad
  const updatePrivacySettings = useCallback(
    async (updates: Partial<UserSettings['privacy']>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updatePrivacySettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                privacy: { ...prev.privacy, ...updates },
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error updating privacy settings:', err);
        setError('Error al actualizar configuración de privacidad');
        throw err;
      }
    },
    [userId]
  );

  // Actualizar configuración de la aplicación
  const updateAppSettings = useCallback(
    async (updates: Partial<UserSettings['app']>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updateAppSettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                app: { ...prev.app, ...updates },
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error updating app settings:', err);
        setError('Error al actualizar configuración de la aplicación');
        throw err;
      }
    },
    [userId]
  );

  // Actualizar configuración de mood logging
  const updateMoodLoggingSettings = useCallback(
    async (updates: Partial<UserSettings['moodLogging']>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updateMoodLoggingSettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                moodLogging: { ...prev.moodLogging, ...updates },
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error updating mood logging settings:', err);
        setError('Error al actualizar configuración de mood logging');
        throw err;
      }
    },
    [userId]
  );

  // Actualizar configuración de psicólogo
  const updatePsychologistSettings = useCallback(
    async (updates: Partial<UserSettings['psychologist']>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.updatePsychologistSettings(userId, updates);

        // Actualizar estado local
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                psychologist: prev.psychologist
                  ? { ...prev.psychologist, ...updates }
                  : (updates as UserSettings['psychologist']),
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error updating psychologist settings:', err);
        setError('Error al actualizar configuración de psicólogo');
        throw err;
      }
    },
    [userId]
  );

  // Resetear a valores por defecto
  const resetToDefaults = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      await userSettingsService.resetToDefaults(userId);

      // Recargar configuración
      const defaultSettings = await userSettingsService.getUserSettings(userId);
      setSettings(defaultSettings);
    } catch (err) {
      console.error('Error resetting settings to defaults:', err);
      setError('Error al resetear configuración');
      throw err;
    }
  }, [userId]);

  // Exportar configuración
  const exportSettings = useCallback(async (): Promise<UserSettings> => {
    if (!userId) throw new Error('No user ID provided');

    try {
      setError(null);
      return await userSettingsService.exportSettings(userId);
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError('Error al exportar configuración');
      throw err;
    }
  }, [userId]);

  // Importar configuración
  const importSettings = useCallback(
    async (settings: Partial<UserSettings>) => {
      if (!userId) return;

      try {
        setError(null);
        await userSettingsService.importSettings(userId, settings);

        // Recargar configuración
        const updatedSettings = await userSettingsService.getUserSettings(userId);
        setSettings(updatedSettings);
      } catch (err) {
        console.error('Error importing settings:', err);
        setError('Error al importar configuración');
        throw err;
      }
    },
    [userId]
  );

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppSettings,
    updateMoodLoggingSettings,
    updatePsychologistSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
};
