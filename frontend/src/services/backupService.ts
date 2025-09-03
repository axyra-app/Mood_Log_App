import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BackupData {
  users: any[];
  moodLogs: any[];
  conversations: any[];
  notifications: any[];
  userSettings: any[];
  userAchievements: any[];
  timestamp: Date;
  version: string;
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0.0';
  private readonly MAX_BACKUP_SIZE = 10 * 1024 * 1024; // 10MB

  // Create backup of user data
  async createUserBackup(userId: string): Promise<BackupData> {
    try {
      console.log('Creating backup for user:', userId);

      const backupData: BackupData = {
        users: [],
        moodLogs: [],
        conversations: [],
        notifications: [],
        userSettings: [],
        userAchievements: [],
        timestamp: new Date(),
        version: this.BACKUP_VERSION,
      };

      // Backup user profile
      const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      backupData.users = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Backup mood logs
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);
      backupData.moodLogs = moodLogsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Backup conversations
      const conversationsQuery = query(collection(db, 'conversations'), where(`participants.${userId}`, '==', true));
      const conversationsSnapshot = await getDocs(conversationsQuery);
      backupData.conversations = conversationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Backup notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      backupData.notifications = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Backup user settings
      const settingsQuery = query(collection(db, 'userSettings'), where('userId', '==', userId));
      const settingsSnapshot = await getDocs(settingsQuery);
      backupData.userSettings = settingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Backup user achievements
      const achievementsQuery = query(collection(db, 'userAchievements'), where('userId', '==', userId));
      const achievementsSnapshot = await getDocs(achievementsQuery);
      backupData.userAchievements = achievementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check backup size
      const backupSize = JSON.stringify(backupData).length;
      if (backupSize > this.MAX_BACKUP_SIZE) {
        throw new Error('Backup size exceeds maximum allowed size');
      }

      console.log('Backup created successfully:', {
        size: backupSize,
        records: {
          users: backupData.users.length,
          moodLogs: backupData.moodLogs.length,
          conversations: backupData.conversations.length,
          notifications: backupData.notifications.length,
          settings: backupData.userSettings.length,
          achievements: backupData.userAchievements.length,
        },
      });

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Download backup as JSON file
  async downloadBackup(userId: string): Promise<void> {
    try {
      const backupData = await this.createUserBackup(userId);
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mood-log-backup-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Backup downloaded successfully');
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  // Validate backup data
  validateBackup(backupData: any): boolean {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return false;
      }

      if (!backupData.version || !backupData.timestamp) {
        return false;
      }

      if (
        !Array.isArray(backupData.users) ||
        !Array.isArray(backupData.moodLogs) ||
        !Array.isArray(backupData.conversations) ||
        !Array.isArray(backupData.notifications) ||
        !Array.isArray(backupData.userSettings) ||
        !Array.isArray(backupData.userAchievements)
      ) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating backup:', error);
      return false;
    }
  }

  // Get backup statistics
  getBackupStats(backupData: BackupData) {
    return {
      version: backupData.version,
      timestamp: backupData.timestamp,
      totalRecords:
        backupData.users.length +
        backupData.moodLogs.length +
        backupData.conversations.length +
        backupData.notifications.length +
        backupData.userSettings.length +
        backupData.userAchievements.length,
      breakdown: {
        users: backupData.users.length,
        moodLogs: backupData.moodLogs.length,
        conversations: backupData.conversations.length,
        notifications: backupData.notifications.length,
        settings: backupData.userSettings.length,
        achievements: backupData.userAchievements.length,
      },
      size: JSON.stringify(backupData).length,
    };
  }

  // Schedule automatic backups
  scheduleAutomaticBackup(userId: string, intervalDays: number = 7) {
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

    const scheduleBackup = () => {
      this.createUserBackup(userId)
        .then(() => {
          console.log('Automatic backup completed');
        })
        .catch((error) => {
          console.error('Automatic backup failed:', error);
        });
    };

    // Schedule first backup
    setTimeout(scheduleBackup, intervalMs);

    // Schedule recurring backups
    setInterval(scheduleBackup, intervalMs);

    console.log(`Automatic backups scheduled every ${intervalDays} days`);
  }
}

export const backupService = new BackupService();
