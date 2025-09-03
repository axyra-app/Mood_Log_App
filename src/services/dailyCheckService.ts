// Daily Check Service - Verifies if it's a new day (Colombia timezone)
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DailyCheck {
  lastDiaryDate: string; // YYYY-MM-DD format
  lastCheck: any; // Firestore timestamp
}

class DailyCheckService {
  private readonly STORAGE_KEY = 'mood_log_daily_check';
  private readonly COLLECTION = 'dailyChecks';

  // Get Colombia timezone date (UTC-5)
  private getColombiaDate(): string {
    const now = new Date();
    const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // UTC-5
    return colombiaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Check if it's a new day (after 12:00 AM Colombia time)
  async isNewDay(userId: string): Promise<boolean> {
    try {
      const today = this.getColombiaDate();

      // Check local storage first
      const localCheck = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (localCheck) {
        const localData = JSON.parse(localCheck);
        if (localData.lastDiaryDate === today) {
          return false; // Already logged today
        }
      }

      // Check Firestore
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as DailyCheck;
        if (data.lastDiaryDate === today) {
          // Update local storage
          localStorage.setItem(
            `${this.STORAGE_KEY}_${userId}`,
            JSON.stringify({
              lastDiaryDate: today,
              lastCheck: new Date().toISOString(),
            })
          );
          return false; // Already logged today
        }
      }

      // If it's a new day, clear any existing diary drafts
      this.clearDiaryDrafts(userId);

      return true; // It's a new day
    } catch (error) {
      console.error('Error checking if new day:', error);
      // Fallback to local storage only
      const localCheck = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (localCheck) {
        const localData = JSON.parse(localCheck);
        const today = this.getColombiaDate();
        const isNewDay = localData.lastDiaryDate !== today;
        if (isNewDay) {
          this.clearDiaryDrafts(userId);
        }
        return isNewDay;
      }
      return true; // Default to new day if error
    }
  }

  // Mark diary as completed for today
  async markDiaryCompleted(userId: string): Promise<void> {
    try {
      const today = this.getColombiaDate();

      // Update Firestore
      const docRef = doc(db, this.COLLECTION, userId);
      await setDoc(
        docRef,
        {
          lastDiaryDate: today,
          lastCheck: serverTimestamp(),
          userId: userId,
        },
        { merge: true }
      );

      // Update local storage
      localStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify({
          lastDiaryDate: today,
          lastCheck: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Error marking diary as completed:', error);
      // Fallback to local storage only
      const today = this.getColombiaDate();
      localStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify({
          lastDiaryDate: today,
          lastCheck: new Date().toISOString(),
        })
      );
    }
  }

  // Get last diary date
  getLastDiaryDate(userId: string): string | null {
    try {
      const localCheck = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (localCheck) {
        const localData = JSON.parse(localCheck);
        return localData.lastDiaryDate;
      }
      return null;
    } catch (error) {
      console.error('Error getting last diary date:', error);
      return null;
    }
  }

  // Clear daily check (for testing or reset)
  clearDailyCheck(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
  }

  // Clear diary drafts when it's a new day
  private clearDiaryDrafts(userId: string): void {
    try {
      // Clear diary draft from localStorage
      localStorage.removeItem('diary_draft');
      localStorage.removeItem('diary_draft_timestamp');

      // Clear any mood flow state
      localStorage.removeItem('mood_flow_state');
      localStorage.removeItem('mood_flow_diary_entry');

      console.log('Diary drafts cleared for new day');
    } catch (error) {
      console.error('Error clearing diary drafts:', error);
    }
  }
}

export const dailyCheckService = new DailyCheckService();
