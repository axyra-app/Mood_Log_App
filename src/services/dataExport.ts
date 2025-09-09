import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ExportData {
  userProfile: any;
  moodLogs: any[];
  notifications: any[];
  settings: any;
  statistics: any;
  exportDate: string;
  version: string;
}

export interface ExportOptions {
  includeMoodLogs: boolean;
  includeNotifications: boolean;
  includeSettings: boolean;
  includeStatistics: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  format: 'json' | 'csv' | 'pdf';
}

// Exportar todos los datos del usuario
export const exportUserData = async (
  userId: string,
  options: ExportOptions = {
    includeMoodLogs: true,
    includeNotifications: true,
    includeSettings: true,
    includeStatistics: true,
    format: 'json',
  }
): Promise<ExportData> => {
  try {
    const exportData: ExportData = {
      userProfile: null,
      moodLogs: [],
      notifications: [],
      settings: null,
      statistics: null,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    // Obtener perfil del usuario
    if (options.includeSettings) {
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
        if (!userDoc.empty) {
          exportData.userProfile = userDoc.docs[0].data();
        }
      } catch (error) {
        console.warn('Error fetching user profile:', error);
      }
    }

    // Obtener mood logs
    if (options.includeMoodLogs) {
      try {
        let moodQuery = query(collection(db, 'moodLogs'), where('userId', '==', userId), orderBy('createdAt', 'desc'));

        // Aplicar filtro de fecha si se especifica
        if (options.dateRange) {
          moodQuery = query(
            collection(db, 'moodLogs'),
            where('userId', '==', userId),
            where('createdAt', '>=', options.dateRange.start),
            where('createdAt', '<=', options.dateRange.end),
            orderBy('createdAt', 'desc')
          );
        }

        const moodSnapshot = await getDocs(moodQuery);
        exportData.moodLogs = moodSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.warn('Error fetching mood logs:', error);
      }
    }

    // Obtener notificaciones
    if (options.includeNotifications) {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        exportData.notifications = notificationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.warn('Error fetching notifications:', error);
      }
    }

    // Obtener configuraciones de notificaciones
    if (options.includeSettings) {
      try {
        const settingsQuery = query(collection(db, 'notificationSettings'), where('userId', '==', userId));
        const settingsSnapshot = await getDocs(settingsQuery);
        if (!settingsSnapshot.empty) {
          exportData.settings = settingsSnapshot.docs[0].data();
        }
      } catch (error) {
        console.warn('Error fetching settings:', error);
      }
    }

    // Calcular estadísticas básicas
    if (options.includeStatistics && exportData.moodLogs.length > 0) {
      exportData.statistics = calculateBasicStatistics(exportData.moodLogs);
    }

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Error al exportar los datos del usuario');
  }
};

// Calcular estadísticas básicas
const calculateBasicStatistics = (moodLogs: any[]) => {
  if (moodLogs.length === 0) return null;

  const moods = moodLogs.map((log) => log.mood);
  const energies = moodLogs.map((log) => log.energy || 0);
  const stresses = moodLogs.map((log) => log.stress || 0);

  return {
    totalEntries: moodLogs.length,
    averageMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
    averageEnergy: energies.reduce((sum, energy) => sum + energy, 0) / energies.length,
    averageStress: stresses.reduce((sum, stress) => sum + stress, 0) / stresses.length,
    moodDistribution: {
      1: moods.filter((m) => m === 1).length,
      2: moods.filter((m) => m === 2).length,
      3: moods.filter((m) => m === 3).length,
      4: moods.filter((m) => m === 4).length,
      5: moods.filter((m) => m === 5).length,
    },
    dateRange: {
      first: moodLogs[moodLogs.length - 1]?.createdAt,
      last: moodLogs[0]?.createdAt,
    },
  };
};

// Exportar a JSON
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

// Exportar a CSV
export const exportToCSV = (data: ExportData): string => {
  let csv = 'Tipo,Datos\n';

  // Mood logs
  if (data.moodLogs.length > 0) {
    csv += '\n# Mood Logs\n';
    csv += 'Fecha,Estado de Ánimo,Energía,Estrés,Notas,Actividades,Emociones\n';

    data.moodLogs.forEach((log) => {
      const date = new Date(log.createdAt?.seconds ? log.createdAt.seconds * 1000 : log.createdAt).toLocaleDateString();
      const activities = Array.isArray(log.activities) ? log.activities.join('; ') : '';
      const emotions = Array.isArray(log.emotions) ? log.emotions.join('; ') : '';

      csv += `"${date}",${log.mood},${log.energy || ''},${log.stress || ''},"${
        log.notes || ''
      }","${activities}","${emotions}"\n`;
    });
  }

  // Notificaciones
  if (data.notifications.length > 0) {
    csv += '\n# Notificaciones\n';
    csv += 'Fecha,Título,Mensaje,Tipo,Categoría,Leída\n';

    data.notifications.forEach((notification) => {
      const date = new Date(
        notification.createdAt?.seconds ? notification.createdAt.seconds * 1000 : notification.createdAt
      ).toLocaleDateString();
      csv += `"${date}","${notification.title}","${notification.message}",${notification.type},${notification.category},${notification.read}\n`;
    });
  }

  return csv;
};

// Descargar archivo
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Exportar datos completos
export const exportCompleteData = async (
  userId: string,
  options: ExportOptions = {
    includeMoodLogs: true,
    includeNotifications: true,
    includeSettings: true,
    includeStatistics: true,
    format: 'json',
  }
): Promise<void> => {
  try {
    const data = await exportUserData(userId, options);

    const timestamp = new Date().toISOString().split('T')[0];
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'json':
        content = exportToJSON(data);
        filename = `mood-log-data-${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = exportToCSV(data);
        filename = `mood-log-data-${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        throw new Error('Formato no soportado');
    }

    downloadFile(content, filename, mimeType);
  } catch (error) {
    console.error('Error exporting complete data:', error);
    throw error;
  }
};

// Exportar solo mood logs
export const exportMoodLogs = async (userId: string, format: 'json' | 'csv' = 'csv'): Promise<void> => {
  const options: ExportOptions = {
    includeMoodLogs: true,
    includeNotifications: false,
    includeSettings: false,
    includeStatistics: false,
    format,
  };

  await exportCompleteData(userId, options);
};

// Exportar datos de respaldo
export const createBackup = async (userId: string): Promise<string> => {
  const data = await exportUserData(userId, {
    includeMoodLogs: true,
    includeNotifications: true,
    includeSettings: true,
    includeStatistics: true,
    format: 'json',
  });

  const backupData = {
    ...data,
    backupType: 'full',
    backupDate: new Date().toISOString(),
    version: '1.0.0',
  };

  return JSON.stringify(backupData, null, 2);
};

// Restaurar datos desde backup
export const restoreFromBackup = async (backupData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(backupData);

    // Validar estructura del backup
    if (!data.userProfile || !data.moodLogs || !data.exportDate) {
      throw new Error('Formato de backup inválido');
    }

    // Aquí se implementaría la lógica para restaurar los datos
    // Por ahora solo validamos que el formato sea correcto
    console.log('Backup válido:', data);
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
};
