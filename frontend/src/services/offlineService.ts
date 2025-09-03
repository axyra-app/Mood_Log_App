// Offline Service for Mood Log App
import { MoodData } from './aiService';

interface OfflineData {
  moodLogs: MoodData[];
  lastSync: Date;
  pendingSync: boolean;
}

class OfflineService {
  private readonly STORAGE_KEY = 'mood_log_offline_data';
  private readonly SYNC_QUEUE_KEY = 'mood_log_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Save data to local storage
  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Load data from local storage
  private loadFromStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  // Save mood log offline
  saveMoodLogOffline(moodData: MoodData): void {
    const offlineData = this.loadFromStorage(this.STORAGE_KEY) || {
      moodLogs: [],
      lastSync: new Date(),
      pendingSync: false,
    };

    const moodLogWithId = {
      ...moodData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      createdAt: new Date(),
    };

    offlineData.moodLogs.push(moodLogWithId);
    offlineData.pendingSync = true;

    this.saveToStorage(this.STORAGE_KEY, offlineData);
    this.addToSyncQueue('moodLog', moodLogWithId);
  }

  // Get offline mood logs
  getOfflineMoodLogs(): MoodData[] {
    const offlineData = this.loadFromStorage(this.STORAGE_KEY);
    return offlineData?.moodLogs || [];
  }

  // Add item to sync queue
  private addToSyncQueue(type: string, data: any): void {
    const queue = this.loadFromStorage(this.SYNC_QUEUE_KEY) || [];
    queue.push({
      type,
      data,
      timestamp: new Date(),
      attempts: 0,
    });
    this.saveToStorage(this.SYNC_QUEUE_KEY, queue);
  }

  // Get sync queue
  getSyncQueue(): any[] {
    return this.loadFromStorage(this.SYNC_QUEUE_KEY) || [];
  }

  // Clear sync queue
  private clearSyncQueue(): void {
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  // Sync pending data when online
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) return;

    const queue = this.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} pending items...`);

    const successfulSyncs: number[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      try {
        await this.syncItem(item);
        successfulSyncs.push(i);
      } catch (error) {
        console.error(`Failed to sync item ${i}:`, error);
        item.attempts = (item.attempts || 0) + 1;

        // Remove item if it has failed too many times
        if (item.attempts >= 3) {
          successfulSyncs.push(i);
        }
      }
    }

    // Remove successfully synced items
    const updatedQueue = queue.filter((_, index) => !successfulSyncs.includes(index));
    this.saveToStorage(this.SYNC_QUEUE_KEY, updatedQueue);

    if (successfulSyncs.length > 0) {
      console.log(`Successfully synced ${successfulSyncs.length} items`);
    }
  }

  // Sync individual item
  private async syncItem(item: any): Promise<void> {
    switch (item.type) {
      case 'moodLog':
        await this.syncMoodLog(item.data);
        break;
      default:
        console.warn(`Unknown sync item type: ${item.type}`);
    }
  }

  // Sync mood log to server
  private async syncMoodLog(moodData: any): Promise<void> {
    // This would typically make an API call to sync with the server
    // For now, we'll simulate it
    console.log('Syncing mood log:', moodData);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove from offline storage
    this.removeOfflineMoodLog(moodData.id);
  }

  // Remove mood log from offline storage
  private removeOfflineMoodLog(id: string): void {
    const offlineData = this.loadFromStorage(this.STORAGE_KEY);
    if (offlineData?.moodLogs) {
      offlineData.moodLogs = offlineData.moodLogs.filter((log: any) => log.id !== id);
      this.saveToStorage(this.STORAGE_KEY, offlineData);
    }
  }

  // Get offline status
  getOfflineStatus(): {
    isOnline: boolean;
    pendingItems: number;
    lastSync: Date | null;
  } {
    const offlineData = this.loadFromStorage(this.STORAGE_KEY);
    const queue = this.getSyncQueue();

    return {
      isOnline: this.isOnline,
      pendingItems: queue.length,
      lastSync: offlineData?.lastSync ? new Date(offlineData.lastSync) : null,
    };
  }

  // Clear all offline data
  clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  // Get storage usage
  getStorageUsage(): {
    used: number;
    available: number;
    percentage: number;
  } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (most browsers allow 5-10MB)
      const available = 5 * 1024 * 1024; // 5MB
      const percentage = (used / available) * 100;

      return {
        used,
        available,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      return {
        used: 0,
        available: 0,
        percentage: 0,
      };
    }
  }

  // Check if storage is getting full
  isStorageFull(): boolean {
    const usage = this.getStorageUsage();
    return usage.percentage > 80;
  }

  // Clean up old offline data
  cleanupOldData(): void {
    const offlineData = this.loadFromStorage(this.STORAGE_KEY);
    if (!offlineData?.moodLogs) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    offlineData.moodLogs = offlineData.moodLogs.filter((log: any) => {
      const logDate = new Date(log.createdAt);
      return logDate > thirtyDaysAgo;
    });

    this.saveToStorage(this.STORAGE_KEY, offlineData);
  }
}

export const offlineService = new OfflineService();
