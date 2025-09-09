import { createBackup, restoreFromBackup } from './dataExport';
import { isOnline } from './offlineService';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  maxBackups: number;
  autoBackup: boolean;
  cloudBackup: boolean;
  lastBackup?: Date;
  nextBackup?: Date;
}

export interface BackupInfo {
  id: string;
  userId: string;
  timestamp: Date;
  size: number;
  type: 'manual' | 'automatic';
  version: string;
  data: any;
}

const BACKUP_CONFIG_KEY = 'mood_log_backup_config';
const BACKUP_HISTORY_KEY = 'mood_log_backup_history';
const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  frequency: 'daily',
  maxBackups: 7,
  autoBackup: true,
  cloudBackup: false,
  lastBackup: undefined,
  nextBackup: undefined,
};

// Obtener configuración de backup
export const getBackupConfig = (): BackupConfig => {
  try {
    const config = localStorage.getItem(BACKUP_CONFIG_KEY);
    if (config) {
      const parsed = JSON.parse(config);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        lastBackup: parsed.lastBackup ? new Date(parsed.lastBackup) : undefined,
        nextBackup: parsed.nextBackup ? new Date(parsed.nextBackup) : undefined,
      };
    }
  } catch (error) {
    console.error('Error getting backup config:', error);
  }

  return DEFAULT_CONFIG;
};

// Guardar configuración de backup
export const saveBackupConfig = (config: BackupConfig): void => {
  try {
    localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving backup config:', error);
  }
};

// Obtener historial de backups
export const getBackupHistory = (): BackupInfo[] => {
  try {
    const history = localStorage.getItem(BACKUP_HISTORY_KEY);
    if (history) {
      const parsed = JSON.parse(history);
      return parsed.map((backup: any) => ({
        ...backup,
        timestamp: new Date(backup.timestamp),
      }));
    }
  } catch (error) {
    console.error('Error getting backup history:', error);
  }

  return [];
};

// Guardar historial de backups
export const saveBackupHistory = (history: BackupInfo[]): void => {
  try {
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving backup history:', error);
  }
};

// Crear backup automático
export const createAutomaticBackup = async (userId: string): Promise<BackupInfo | null> => {
  try {
    if (!isOnline()) {
      console.log('No se puede crear backup automático: sin conexión');
      return null;
    }

    const config = getBackupConfig();
    if (!config.enabled || !config.autoBackup) {
      return null;
    }

    // Verificar si es necesario crear backup
    if (!shouldCreateBackup(config)) {
      return null;
    }

    console.log('Creando backup automático...');

    // Crear backup
    const backupData = await createBackup(userId);
    const backupSize = new Blob([backupData]).size;

    const backupInfo: BackupInfo = {
      id: `backup_${Date.now()}`,
      userId,
      timestamp: new Date(),
      size: backupSize,
      type: 'automatic',
      version: '1.0.0',
      data: backupData,
    };

    // Guardar en historial
    const history = getBackupHistory();
    history.unshift(backupInfo);

    // Mantener solo el número máximo de backups
    const maxBackups = config.maxBackups;
    if (history.length > maxBackups) {
      history.splice(maxBackups);
    }

    saveBackupHistory(history);

    // Actualizar configuración
    config.lastBackup = new Date();
    config.nextBackup = calculateNextBackup(config);
    saveBackupConfig(config);

    console.log('Backup automático creado exitosamente');
    return backupInfo;
  } catch (error) {
    console.error('Error creating automatic backup:', error);
    return null;
  }
};

// Crear backup manual
export const createManualBackup = async (userId: string): Promise<BackupInfo | null> => {
  try {
    console.log('Creando backup manual...');

    const backupData = await createBackup(userId);
    const backupSize = new Blob([backupData]).size;

    const backupInfo: BackupInfo = {
      id: `backup_${Date.now()}`,
      userId,
      timestamp: new Date(),
      size: backupSize,
      type: 'manual',
      version: '1.0.0',
      data: backupData,
    };

    // Guardar en historial
    const history = getBackupHistory();
    history.unshift(backupInfo);

    // Mantener solo el número máximo de backups
    const config = getBackupConfig();
    const maxBackups = config.maxBackups;
    if (history.length > maxBackups) {
      history.splice(maxBackups);
    }

    saveBackupHistory(history);

    console.log('Backup manual creado exitosamente');
    return backupInfo;
  } catch (error) {
    console.error('Error creating manual backup:', error);
    return null;
  }
};

// Verificar si se debe crear backup
const shouldCreateBackup = (config: BackupConfig): boolean => {
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
};

// Calcular próximo backup
const calculateNextBackup = (config: BackupConfig): Date => {
  const now = new Date();

  switch (config.frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
};

// Restaurar desde backup
export const restoreBackup = async (backupId: string): Promise<boolean> => {
  try {
    const history = getBackupHistory();
    const backup = history.find((b) => b.id === backupId);

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    const success = await restoreFromBackup(backup.data);

    if (success) {
      console.log('Backup restaurado exitosamente');
    }

    return success;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
};

// Eliminar backup
export const deleteBackup = (backupId: string): boolean => {
  try {
    const history = getBackupHistory();
    const filteredHistory = history.filter((b) => b.id !== backupId);

    if (filteredHistory.length === history.length) {
      return false; // Backup no encontrado
    }

    saveBackupHistory(filteredHistory);
    console.log('Backup eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('Error deleting backup:', error);
    return false;
  }
};

// Obtener estadísticas de backup
export const getBackupStats = (): {
  totalBackups: number;
  totalSize: number;
  lastBackup: Date | null;
  nextBackup: Date | null;
  oldestBackup: Date | null;
  newestBackup: Date | null;
} => {
  const history = getBackupHistory();
  const config = getBackupConfig();

  const totalBackups = history.length;
  const totalSize = history.reduce((sum, backup) => sum + backup.size, 0);
  const lastBackup = config.lastBackup;
  const nextBackup = config.nextBackup;

  const timestamps = history.map((b) => b.timestamp.getTime());
  const oldestBackup = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
  const newestBackup = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

  return {
    totalBackups,
    totalSize,
    lastBackup,
    nextBackup,
    oldestBackup,
    newestBackup,
  };
};

// Limpiar backups antiguos
export const cleanupOldBackups = (): void => {
  try {
    const config = getBackupConfig();
    const history = getBackupHistory();

    // Mantener solo el número máximo de backups
    if (history.length > config.maxBackups) {
      const cleanedHistory = history.slice(0, config.maxBackups);
      saveBackupHistory(cleanedHistory);
      console.log(`Limpiados ${history.length - cleanedHistory.length} backups antiguos`);
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
};

// Verificar integridad de backup
export const verifyBackupIntegrity = (backupId: string): boolean => {
  try {
    const history = getBackupHistory();
    const backup = history.find((b) => b.id === backupId);

    if (!backup) {
      return false;
    }

    // Verificar que el backup tenga datos
    if (!backup.data || typeof backup.data !== 'string') {
      return false;
    }

    // Verificar que se pueda parsear como JSON
    try {
      JSON.parse(backup.data);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('Error verifying backup integrity:', error);
    return false;
  }
};

// Exportar backup
export const exportBackup = (backupId: string): void => {
  try {
    const history = getBackupHistory();
    const backup = history.find((b) => b.id === backupId);

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    const blob = new Blob([backup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-log-backup-${backup.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting backup:', error);
  }
};

// Inicializar sistema de backup
export const initializeBackupSystem = (userId: string): void => {
  try {
    const config = getBackupConfig();

    // Calcular próximo backup si no existe
    if (!config.nextBackup) {
      config.nextBackup = calculateNextBackup(config);
      saveBackupConfig(config);
    }

    // Limpiar backups antiguos
    cleanupOldBackups();

    console.log('Sistema de backup inicializado');
  } catch (error) {
    console.error('Error initializing backup system:', error);
  }
};
