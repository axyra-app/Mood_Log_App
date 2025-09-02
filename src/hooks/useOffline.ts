import { useEffect, useState } from 'react';
import { offlineService } from '../services/offlineService';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(offlineService.isDeviceOnline());
  const [pendingItems, setPendingItems] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = offlineService.getOfflineStatus();
      setIsOnline(status.isOnline);
      setPendingItems(status.pendingItems);
      setLastSync(status.lastSync);
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      offlineService.syncPendingData().then(() => {
        updateStatus();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic status update
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncPendingData = async () => {
    if (isOnline) {
      await offlineService.syncPendingData();
      const status = offlineService.getOfflineStatus();
      setPendingItems(status.pendingItems);
      setLastSync(status.lastSync);
    }
  };

  const saveOffline = (data: any) => {
    offlineService.saveMoodLogOffline(data);
    const status = offlineService.getOfflineStatus();
    setPendingItems(status.pendingItems);
  };

  const getOfflineData = () => {
    return offlineService.getOfflineMoodLogs();
  };

  const clearOfflineData = () => {
    offlineService.clearOfflineData();
    setPendingItems(0);
    setLastSync(null);
  };

  const getStorageUsage = () => {
    return offlineService.getStorageUsage();
  };

  const isStorageFull = () => {
    return offlineService.isStorageFull();
  };

  return {
    isOnline,
    pendingItems,
    lastSync,
    syncPendingData,
    saveOffline,
    getOfflineData,
    clearOfflineData,
    getStorageUsage,
    isStorageFull,
  };
};
