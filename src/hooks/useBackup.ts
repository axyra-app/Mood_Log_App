import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  cleanupOldBackups,
  createAutomaticBackup,
  createManualBackup,
  deleteBackup,
  exportBackup,
  getBackupConfig,
  getBackupHistory,
  getBackupStats,
  initializeBackupSystem,
  restoreBackup,
  saveBackupConfig,
  verifyBackupIntegrity,
  type BackupConfig,
  type BackupInfo,
} from '../services/backupService';

export const useBackup = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<BackupConfig>(getBackupConfig());
  const [history, setHistory] = useState<BackupInfo[]>(getBackupHistory());
  const [stats, setStats] = useState(getBackupStats());
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualizar configuración
  const updateConfig = useCallback(
    (newConfig: Partial<BackupConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      saveBackupConfig(updatedConfig);
    },
    [config]
  );

  // Crear backup manual
  const createManual = useCallback(async (): Promise<BackupInfo | null> => {
    if (!user?.uid) {
      setError('Usuario no autenticado');
      return null;
    }

    try {
      setIsCreating(true);
      setError(null);

      const backup = await createManualBackup(user.uid);

      if (backup) {
        // Actualizar historial y estadísticas
        const newHistory = getBackupHistory();
        setHistory(newHistory);
        setStats(getBackupStats());
      }

      return backup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user?.uid]);

  // Crear backup automático
  const createAutomatic = useCallback(async (): Promise<BackupInfo | null> => {
    if (!user?.uid) return null;

    try {
      const backup = await createAutomaticBackup(user.uid);

      if (backup) {
        // Actualizar historial y estadísticas
        const newHistory = getBackupHistory();
        setHistory(newHistory);
        setStats(getBackupStats());
      }

      return backup;
    } catch (err) {
      console.error('Error creating automatic backup:', err);
      return null;
    }
  }, [user?.uid]);

  // Restaurar backup
  const restore = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      setIsRestoring(true);
      setError(null);

      const success = await restoreBackup(backupId);

      if (!success) {
        setError('Error al restaurar el backup');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // Eliminar backup
  const remove = useCallback((backupId: string): boolean => {
    try {
      const success = deleteBackup(backupId);

      if (success) {
        // Actualizar historial y estadísticas
        const newHistory = getBackupHistory();
        setHistory(newHistory);
        setStats(getBackupStats());
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Exportar backup
  const exportBackupFile = useCallback((backupId: string): void => {
    try {
      exportBackup(backupId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  }, []);

  // Verificar integridad de backup
  const verifyIntegrity = useCallback((backupId: string): boolean => {
    try {
      return verifyBackupIntegrity(backupId);
    } catch (err) {
      console.error('Error verifying backup integrity:', err);
      return false;
    }
  }, []);

  // Limpiar backups antiguos
  const cleanup = useCallback(() => {
    try {
      cleanupOldBackups();
      const newHistory = getBackupHistory();
      setHistory(newHistory);
      setStats(getBackupStats());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  }, []);

  // Obtener backup por ID
  const getBackupById = useCallback(
    (backupId: string): BackupInfo | null => {
      return history.find((backup) => backup.id === backupId) || null;
    },
    [history]
  );

  // Obtener backups por tipo
  const getBackupsByType = useCallback(
    (type: 'manual' | 'automatic'): BackupInfo[] => {
      return history.filter((backup) => backup.type === type);
    },
    [history]
  );

  // Obtener backups recientes
  const getRecentBackups = useCallback(
    (limit: number = 5): BackupInfo[] => {
      return history.slice(0, limit);
    },
    [history]
  );

  // Verificar si hay backups
  const hasBackups = history.length > 0;

  // Verificar si el backup está habilitado
  const isBackupEnabled = config.enabled;

  // Obtener próximo backup programado
  const getNextScheduledBackup = useCallback((): Date | null => {
    return config.nextBackup || null;
  }, [config.nextBackup]);

  // Verificar si es hora de crear backup automático
  const shouldCreateAutomaticBackup = useCallback((): boolean => {
    if (!config.enabled || !config.autoBackup) {
      return false;
    }

    if (!config.lastBackup) {
      return true; // Primera vez
    }

    const now = new Date();
    const lastBackup = config.lastBackup;
    const timeDiff = now.getTime() - lastBackup.getTime();

    switch (config.frequency) {
      case 'daily':
        return timeDiff >= 24 * 60 * 60 * 1000; // 24 horas
      case 'weekly':
        return timeDiff >= 7 * 24 * 60 * 60 * 1000; // 7 días
      case 'monthly':
        return timeDiff >= 30 * 24 * 60 * 60 * 1000; // 30 días
      default:
        return false;
    }
  }, [config]);

  // Formatear tamaño de archivo
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Formatear fecha
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Inicializar sistema de backup
  useEffect(() => {
    if (user?.uid) {
      initializeBackupSystem(user.uid);
    }
  }, [user?.uid]);

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getBackupStats());
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  // Verificar si se debe crear backup automático
  useEffect(() => {
    if (user?.uid && shouldCreateAutomaticBackup()) {
      createAutomatic();
    }
  }, [user?.uid, shouldCreateAutomaticBackup, createAutomatic]);

  return {
    config,
    history,
    stats,
    isCreating,
    isRestoring,
    error,
    updateConfig,
    createManual,
    createAutomatic,
    restore,
    remove,
    exportBackupFile,
    verifyIntegrity,
    cleanup,
    getBackupById,
    getBackupsByType,
    getRecentBackups,
    hasBackups,
    isBackupEnabled,
    getNextScheduledBackup,
    shouldCreateAutomaticBackup,
    formatFileSize,
    formatDate,
  };
};
