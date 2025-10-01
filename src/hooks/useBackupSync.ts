import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useState } from 'react';
import { db, storage } from '../services/firebase';

// Tipos para el sistema de respaldo
export interface BackupConfig {
  collections: string[];
  includeFiles: boolean;
  compression: boolean;
  encryption: boolean;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

export interface BackupData {
  id: string;
  name: string;
  timestamp: Date;
  size: number;
  collections: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  downloadUrl?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  conflicts: number;
  isSyncing: boolean;
}

// Hook principal para respaldo y sincronización
export const useBackupSync = () => {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0,
    isSyncing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
      // Iniciar sincronización automática cuando vuelve la conexión
      syncPendingChanges();
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Crear respaldo completo
  const createBackup = useCallback(async (config: BackupConfig): Promise<BackupData> => {
    try {
      setLoading(true);
      setError(null);

      const backupId = `backup_${Date.now()}`;
      const backupData: BackupData = {
        id: backupId,
        name: `Respaldo ${new Date().toLocaleString()}`,
        timestamp: new Date(),
        size: 0,
        collections: config.collections,
        status: 'in_progress',
      };

      // Agregar a la lista de respaldos
      setBackups((prev) => [backupData, ...prev]);

      const backupContent: any = {
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          collections: config.collections,
        },
        data: {},
      };

      // Exportar datos de cada colección
      for (const collectionName of config.collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          const collectionData: any = {};

          snapshot.docs.forEach((doc) => {
            collectionData[doc.id] = {
              ...doc.data(),
              _backupTimestamp: new Date().toISOString(),
            };
          });

          backupContent.data[collectionName] = collectionData;
        } catch (err) {
          console.error(`Error exporting collection ${collectionName}:`, err);
        }
      }

      // Comprimir si está habilitado
      let finalContent = backupContent;
      if (config.compression) {
        // Implementar compresión (simplificado)
        finalContent = {
          ...backupContent,
          compressed: true,
        };
      }

      // Convertir a JSON
      const jsonContent = JSON.stringify(finalContent, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });

      // Subir a Firebase Storage
      const storageRef = ref(storage, `backups/${backupId}.json`);
      await uploadBytes(storageRef, blob);

      const downloadUrl = await getDownloadURL(storageRef);

      // Actualizar estado del respaldo
      const completedBackup: BackupData = {
        ...backupData,
        status: 'completed',
        size: blob.size,
        downloadUrl,
      };

      setBackups((prev) => prev.map((b) => (b.id === backupId ? completedBackup : b)));

      return completedBackup;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating backup:', err);

      // Marcar respaldo como fallido
      setBackups((prev) => prev.map((b) => (b.id === backupId ? { ...b, status: 'failed', error: err.message } : b)));

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar desde respaldo
  const restoreBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Descargar archivo de respaldo
      const storageRef = ref(storage, `backups/${backupId}.json`);
      const downloadUrl = await getDownloadURL(storageRef);

      const response = await fetch(downloadUrl);
      const backupContent = await response.json();

      // Restaurar datos de cada colección
      for (const [collectionName, collectionData] of Object.entries(backupContent.data)) {
        try {
          for (const [docId, docData] of Object.entries(collectionData as any)) {
            await setDoc(doc(db, collectionName, docId), {
              ...docData,
              _restoredAt: new Date(),
            });
          }
        } catch (err) {
          console.error(`Error restoring collection ${collectionName}:`, err);
        }
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error restoring backup:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar respaldo
  const deleteBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      const storageRef = ref(storage, `backups/${backupId}.json`);
      await deleteObject(storageRef);

      setBackups((prev) => prev.filter((b) => b.id !== backupId));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting backup:', err);
      return false;
    }
  }, []);

  // Sincronizar cambios pendientes
  const syncPendingChanges = useCallback(async () => {
    if (syncStatus.isSyncing) return;

    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

      // Obtener cambios pendientes del localStorage
      const pendingChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]');

      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'create':
              await setDoc(doc(db, change.collection, change.id), change.data);
              break;
            case 'update':
              await updateDoc(doc(db, change.collection, change.id), change.data);
              break;
            case 'delete':
              await deleteDoc(doc(db, change.collection, change.id));
              break;
          }
        } catch (err) {
          console.error('Error syncing change:', err);
        }
      }

      // Limpiar cambios pendientes
      localStorage.removeItem('pendingChanges');

      setSyncStatus((prev) => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges: 0,
        isSyncing: false,
      }));
    } catch (err: any) {
      setError(err.message);
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [syncStatus.isSyncing]);

  // Agregar cambio pendiente
  const addPendingChange = useCallback((change: any) => {
    const pendingChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
    pendingChanges.push({
      ...change,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));

    setSyncStatus((prev) => ({
      ...prev,
      pendingChanges: pendingChanges.length,
    }));
  }, []);

  // Exportar datos específicos
  const exportData = useCallback(
    async (collectionName: string, filters?: any, format: 'json' | 'csv' = 'json'): Promise<string> => {
      try {
        setLoading(true);
        setError(null);

        let q = query(collection(db, collectionName));

        // Aplicar filtros si existen
        if (filters) {
          Object.entries(filters).forEach(([field, value]) => {
            q = query(q, where(field, '==', value));
          });
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let exportContent: string;

        if (format === 'csv') {
          // Convertir a CSV
          const headers = Object.keys(data[0] || {});
          const csvRows = [
            headers.join(','),
            ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
          ];
          exportContent = csvRows.join('\n');
        } else {
          // JSON
          exportContent = JSON.stringify(data, null, 2);
        }

        return exportContent;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Importar datos
  const importData = useCallback(
    async (
      collectionName: string,
      data: any[],
      mergeMode: 'replace' | 'merge' | 'skip' = 'replace'
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        for (const item of data) {
          const docRef = doc(db, collectionName, item.id);

          if (mergeMode === 'replace') {
            await setDoc(docRef, item);
          } else if (mergeMode === 'merge') {
            await setDoc(docRef, item, { merge: true });
          } else if (mergeMode === 'skip') {
            const existingDoc = await getDoc(docRef);
            if (!existingDoc.exists()) {
              await setDoc(docRef, item);
            }
          }
        }

        return true;
      } catch (err: any) {
        setError(err.message);
        console.error('Error importing data:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Obtener estadísticas de respaldo
  const getBackupStats = useCallback(() => {
    const totalBackups = backups.length;
    const completedBackups = backups.filter((b) => b.status === 'completed').length;
    const failedBackups = backups.filter((b) => b.status === 'failed').length;
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      totalBackups,
      completedBackups,
      failedBackups,
      totalSize,
      successRate: totalBackups > 0 ? (completedBackups / totalBackups) * 100 : 0,
    };
  }, [backups]);

  return {
    backups,
    syncStatus,
    loading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    syncPendingChanges,
    addPendingChange,
    exportData,
    importData,
    getBackupStats,
  };
};

// Hook para sincronización en tiempo real
export const useRealtimeSync = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // Detectar cambios en tiempo real
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_DATA') {
          setSyncQueue((prev) => [...prev, event.data.payload]);
        }
      });
    }
  }, []);

  // Procesar cola de sincronización
  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0) return;

    try {
      for (const item of syncQueue) {
        // Procesar cada elemento de la cola
        await processSyncItem(item);
      }

      setSyncQueue([]);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }, [syncQueue]);

  const processSyncItem = async (item: any) => {
    // Implementar lógica específica de sincronización
    console.log('Processing sync item:', item);
  };

  return {
    isConnected,
    lastSync,
    syncQueue,
    processSyncQueue,
  };
};

// Utilidades para respaldo
export const backupUtils = {
  // Formatear tamaño de archivo
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generar nombre de respaldo
  generateBackupName: (): string => {
    const now = new Date();
    return `backup_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}`;
  },

  // Validar datos antes de importar
  validateImportData: (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Los datos deben ser un array');
    }

    data.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Elemento ${index}: falta el campo 'id'`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Comprimir datos
  compressData: async (data: any): Promise<string> => {
    // Implementación simplificada de compresión
    return JSON.stringify(data);
  },

  // Descomprimir datos
  decompressData: async (compressedData: string): Promise<any> => {
    // Implementación simplificada de descompresión
    return JSON.parse(compressedData);
  },
};

export default backupUtils;
