import { useCallback, useEffect, useState } from 'react';
import {
  createMoodLogOffline,
  createNotificationOffline,
  getMoodLogsOffline,
  getNotificationsOffline,
  getSyncStatus,
  onConnectionChange,
  syncOfflineData,
} from '../services/offlineService';

export interface OfflineStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingActions: number;
  offlineDataSize: number;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>(() => {
    const initialStatus = getSyncStatus();
    return {
      isOnline: initialStatus.isOnline,
      lastSync: initialStatus.lastSync,
      pendingActions: initialStatus.pendingActions,
      offlineDataSize: initialStatus.offlineDataSize,
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Actualizar estado cuando cambie la conectividad
  useEffect(() => {
    const unsubscribe = onConnectionChange((online) => {
      setStatus((prev) => ({ ...prev, isOnline: online }));

      // Sincronizar cuando vuelva la conexión
      if (online) {
        handleSync();
      }
    });

    return unsubscribe;
  }, []);

  // Actualizar estado periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        lastSync: currentStatus.lastSync,
        pendingActions: currentStatus.pendingActions,
        offlineDataSize: currentStatus.offlineDataSize,
      }));
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Sincronizar datos
  const handleSync = useCallback(async () => {
    if (!status.isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      await syncOfflineData();

      // Actualizar estado después de la sincronización
      const newStatus = getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        lastSync: newStatus.lastSync,
        pendingActions: newStatus.pendingActions,
        offlineDataSize: newStatus.offlineDataSize,
      }));
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [status.isOnline, isSyncing]);

  // Crear mood log (online u offline)
  const createMoodLog = useCallback(async (moodData: any) => {
    try {
      const id = await createMoodLogOffline(moodData);

      // Actualizar estado
      const newStatus = getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        pendingActions: newStatus.pendingActions,
        offlineDataSize: newStatus.offlineDataSize,
      }));

      return id;
    } catch (error) {
      console.error('Error creating mood log:', error);
      throw error;
    }
  }, []);

  // Obtener mood logs (online + offline)
  const getMoodLogs = useCallback(async (userId: string) => {
    try {
      return await getMoodLogsOffline(userId);
    } catch (error) {
      console.error('Error getting mood logs:', error);
      throw error;
    }
  }, []);

  // Crear notificación (online u offline)
  const createNotification = useCallback(async (notificationData: any) => {
    try {
      const id = await createNotificationOffline(notificationData);

      // Actualizar estado
      const newStatus = getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        pendingActions: newStatus.pendingActions,
        offlineDataSize: newStatus.offlineDataSize,
      }));

      return id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, []);

  // Obtener notificaciones (online + offline)
  const getNotifications = useCallback(async (userId: string) => {
    try {
      return await getNotificationsOffline(userId);
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }, []);

  return {
    status,
    isSyncing,
    handleSync,
    createMoodLog,
    getMoodLogs,
    createNotification,
    getNotifications,
  };
};
