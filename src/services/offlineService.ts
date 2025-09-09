import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';

export interface OfflineData {
  moodLogs: any[];
  notifications: any[];
  settings: any;
  lastSync: Date;
  pendingActions: PendingAction[];
}

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: Date;
  retries: number;
}

const OFFLINE_STORAGE_KEY = 'mood_log_offline_data';
const PENDING_ACTIONS_KEY = 'mood_log_pending_actions';
const MAX_RETRIES = 3;

// Verificar si está online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Escuchar cambios de conectividad
export const onConnectionChange = (callback: (isOnline: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Guardar datos offline
export const saveOfflineData = (data: Partial<OfflineData>): void => {
  try {
    const existingData = getOfflineData();
    const updatedData = {
      ...existingData,
      ...data,
      lastSync: new Date(),
    };

    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
};

// Obtener datos offline
export const getOfflineData = (): OfflineData => {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastSync: new Date(parsed.lastSync),
      };
    }
  } catch (error) {
    console.error('Error getting offline data:', error);
  }

  return {
    moodLogs: [],
    notifications: [],
    settings: null,
    lastSync: new Date(),
    pendingActions: [],
  };
};

// Guardar acción pendiente
export const savePendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): void => {
  try {
    const pendingActions = getPendingActions();
    const newAction: PendingAction = {
      ...action,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retries: 0,
    };

    pendingActions.push(newAction);
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  } catch (error) {
    console.error('Error saving pending action:', error);
  }
};

// Obtener acciones pendientes
export const getPendingActions = (): PendingAction[] => {
  try {
    const data = localStorage.getItem(PENDING_ACTIONS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map((action: any) => ({
        ...action,
        timestamp: new Date(action.timestamp),
      }));
    }
  } catch (error) {
    console.error('Error getting pending actions:', error);
  }

  return [];
};

// Procesar acciones pendientes cuando vuelva la conexión
export const processPendingActions = async (): Promise<void> => {
  if (!isOnline()) return;

  const pendingActions = getPendingActions();
  const successfulActions: string[] = [];
  const failedActions: PendingAction[] = [];

  for (const action of pendingActions) {
    try {
      await executePendingAction(action);
      successfulActions.push(action.id);
    } catch (error) {
      console.error(`Error executing pending action ${action.id}:`, error);

      if (action.retries < MAX_RETRIES) {
        action.retries++;
        failedActions.push(action);
      }
    }
  }

  // Remover acciones exitosas y actualizar las fallidas
  const remainingActions = failedActions;
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(remainingActions));

  // Notificar al usuario sobre las acciones procesadas
  if (successfulActions.length > 0) {
    console.log(`${successfulActions.length} acciones pendientes procesadas exitosamente`);
  }
};

// Ejecutar una acción pendiente
const executePendingAction = async (action: PendingAction): Promise<void> => {
  const { type, collection: collectionName, data } = action;

  switch (type) {
    case 'create':
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      break;

    case 'update':
      // Implementar actualización cuando sea necesario
      console.log('Update action not implemented yet');
      break;

    case 'delete':
      // Implementar eliminación cuando sea necesario
      console.log('Delete action not implemented yet');
      break;

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};

// Crear mood log offline
export const createMoodLogOffline = async (moodData: any): Promise<string> => {
  const actionId = `mood_${Date.now()}`;

  if (isOnline()) {
    try {
      // Intentar crear online primero
      const docRef = await addDoc(collection(db, 'moodLogs'), {
        ...moodData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating mood log online, saving offline:', error);
    }
  }

  // Guardar offline
  const offlineMoodLog = {
    ...moodData,
    id: actionId,
    createdAt: new Date(),
    isOffline: true,
  };

  // Actualizar datos offline
  const offlineData = getOfflineData();
  offlineData.moodLogs.unshift(offlineMoodLog);
  saveOfflineData(offlineData);

  // Guardar acción pendiente
  savePendingAction({
    type: 'create',
    collection: 'moodLogs',
    data: moodData,
  });

  return actionId;
};

// Obtener mood logs (online + offline)
export const getMoodLogsOffline = async (userId: string): Promise<any[]> => {
  const offlineData = getOfflineData();
  let onlineLogs: any[] = [];

  if (isOnline()) {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'moodLogs'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(100))
      );
      onlineLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching online mood logs:', error);
    }
  }

  // Combinar logs online y offline
  const allLogs = [...onlineLogs, ...offlineData.moodLogs.filter((log) => log.userId === userId)];

  // Ordenar por fecha de creación
  allLogs.sort((a, b) => {
    const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
    const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return allLogs;
};

// Crear notificación offline
export const createNotificationOffline = async (notificationData: any): Promise<string> => {
  const actionId = `notification_${Date.now()}`;

  if (isOnline()) {
    try {
      // Intentar crear online primero
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification online, saving offline:', error);
    }
  }

  // Guardar offline
  const offlineNotification = {
    ...notificationData,
    id: actionId,
    createdAt: new Date(),
    isOffline: true,
  };

  // Actualizar datos offline
  const offlineData = getOfflineData();
  offlineData.notifications.unshift(offlineNotification);
  saveOfflineData(offlineData);

  // Guardar acción pendiente
  savePendingAction({
    type: 'create',
    collection: 'notifications',
    data: notificationData,
  });

  return actionId;
};

// Obtener notificaciones (online + offline)
export const getNotificationsOffline = async (userId: string): Promise<any[]> => {
  const offlineData = getOfflineData();
  let onlineNotifications: any[] = [];

  if (isOnline()) {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50))
      );
      onlineNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching online notifications:', error);
    }
  }

  // Combinar notificaciones online y offline
  const allNotifications = [
    ...onlineNotifications,
    ...offlineData.notifications.filter((notif) => notif.userId === userId),
  ];

  // Ordenar por fecha de creación
  allNotifications.sort((a, b) => {
    const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
    const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return allNotifications;
};

// Sincronizar datos cuando vuelva la conexión
export const syncOfflineData = async (): Promise<void> => {
  if (!isOnline()) return;

  try {
    // Procesar acciones pendientes
    await processPendingActions();

    // Limpiar datos offline antiguos (más de 7 días)
    const offlineData = getOfflineData();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    offlineData.moodLogs = offlineData.moodLogs.filter((log) => new Date(log.createdAt) > sevenDaysAgo);

    offlineData.notifications = offlineData.notifications.filter((notif) => new Date(notif.createdAt) > sevenDaysAgo);

    saveOfflineData(offlineData);

    console.log('Datos offline sincronizados exitosamente');
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
};

// Limpiar datos offline
export const clearOfflineData = (): void => {
  try {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    localStorage.removeItem(PENDING_ACTIONS_KEY);
    console.log('Datos offline limpiados');
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
};

// Obtener estado de sincronización
export const getSyncStatus = (): {
  isOnline: boolean;
  lastSync: Date | null;
  pendingActions: number;
  offlineDataSize: number;
} => {
  const offlineData = getOfflineData();
  const pendingActions = getPendingActions();

  return {
    isOnline: isOnline(),
    lastSync: offlineData.lastSync,
    pendingActions: pendingActions.length,
    offlineDataSize: offlineData.moodLogs.length + offlineData.notifications.length,
  };
};
