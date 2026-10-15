import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface RealMoodData {
  moodLogs: Array<{
    mood: number;
    date: Date;
    notes?: string;
    emotions?: string[];
    activities?: string[];
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export const getRealMoodData = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<RealMoodData> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const moodLogsQuery = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(moodLogsQuery);
    const moodLogs = snapshot.docs.map((snapshotDoc) => {
      const data = snapshotDoc.data();
      return {
        mood: data.mood || 0,
        date: data.createdAt?.toDate() || new Date(),
        notes: data.notes || '',
        emotions: data.emotions || [],
        activities: data.activities || [],
      };
    });

    return {
      moodLogs,
      period: { start: startDate, end: endDate },
    };
  } catch (error) {
    console.error('Error loading mood data for the requested period:', error);
    throw error;
  }
};
