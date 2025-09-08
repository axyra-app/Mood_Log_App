import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Chat, ChatMessage, MoodLog, Psychologist, User } from '../types';
import { db } from './firebase';

// ========================================
// USUARIOS
// ========================================

export const createUser = async (userData: Partial<User>) => {
  try {
    const userRef = doc(collection(db, 'users'));
    const user = {
      ...userData,
      id: userRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(userRef, user);
    return userRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// ========================================
// MOOD LOGS
// ========================================

export const saveMoodLog = async (moodData: Partial<MoodLog>): Promise<string> => {
  try {
    const moodLogRef = await addDoc(collection(db, 'moodLogs'), {
      ...moodData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return moodLogRef.id;
  } catch (error) {
    console.error('Error saving mood log:', error);
    throw error;
  }
};

export const getMoodLogs = async (userId: string, limitCount: number = 30): Promise<MoodLog[]> => {
  try {
    const q = query(
      collection(db, 'moodLogs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];
  } catch (error) {
    console.error('Error getting mood logs:', error);
    throw error;
  }
};

export const getMoodLogsRealtime = (userId: string, callback: (logs: MoodLog[]) => void) => {
  const q = query(collection(db, 'moodLogs'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(30));

  return onSnapshot(q, (querySnapshot) => {
    const logs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodLog[];
    callback(logs);
  });
};

// ========================================
// PSICÓLOGOS
// ========================================

export const getPsychologists = async (): Promise<Psychologist[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'psychologist'), where('isAvailable', '==', true));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Psychologist[];
  } catch (error) {
    console.error('Error getting psychologists:', error);
    throw error;
  }
};

export const getPsychologist = async (psychologistId: string): Promise<Psychologist | null> => {
  try {
    const psychologistRef = doc(db, 'users', psychologistId);
    const psychologistSnap = await getDoc(psychologistRef);

    if (psychologistSnap.exists()) {
      return { id: psychologistSnap.id, ...psychologistSnap.data() } as Psychologist;
    }
    return null;
  } catch (error) {
    console.error('Error getting psychologist:', error);
    throw error;
  }
};

// ========================================
// CHAT Y MENSAJES
// ========================================

export const createChat = async (participants: string[]): Promise<string> => {
  try {
    const chatRef = await addDoc(collection(db, 'conversations'), {
      participants,
      lastMessageAt: serverTimestamp(),
      isActive: true,
      createdAt: serverTimestamp(),
    });
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const sendMessage = async (messageData: Partial<ChatMessage>): Promise<string> => {
  try {
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp(),
      isRead: false,
    });
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const getMessagesRealtime = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(messages);
  });
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// ========================================
// ESTADÍSTICAS
// ========================================

export const getUserStatistics = async (userId: string) => {
  try {
    const moodLogs = await getMoodLogs(userId, 365); // Último año

    if (moodLogs.length === 0) {
      return {
        averageMood: 0,
        totalLogs: 0,
        weeklyTrend: 'stable',
        monthlyData: [],
        weeklyData: [],
        patterns: {
          bestDay: 'N/A',
          worstDay: 'N/A',
          commonActivities: [],
          commonEmotions: [],
        },
      };
    }

    // Calcular promedio de mood
    const averageMood = moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodLogs.length;

    // Calcular tendencia semanal
    const lastWeek = moodLogs.filter((log) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return log.createdAt && log.createdAt.toDate() >= weekAgo;
    });

    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (lastWeek.length >= 2) {
      const firstHalf = lastWeek.slice(0, Math.floor(lastWeek.length / 2));
      const secondHalf = lastWeek.slice(Math.floor(lastWeek.length / 2));

      const firstAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) weeklyTrend = 'improving';
      else if (secondAvg < firstAvg - 0.5) weeklyTrend = 'declining';
    }

    // Datos semanales
    const weeklyData = lastWeek.map((log) => ({
      date: log.createdAt?.toDate().toISOString().split('T')[0] || '',
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
    }));

    // Datos mensuales
    const monthlyData = [];
    const months = new Map();

    moodLogs.forEach((log) => {
      if (log.createdAt) {
        const month = log.createdAt.toDate().toISOString().substring(0, 7);
        if (!months.has(month)) {
          months.set(month, []);
        }
        months.get(month).push(log);
      }
    });

    months.forEach((logs, month) => {
      const avgMood = logs.reduce((sum: number, log: MoodLog) => sum + log.mood, 0) / logs.length;
      monthlyData.push({
        month,
        averageMood: Math.round(avgMood * 10) / 10,
        totalLogs: logs.length,
      });
    });

    // Patrones
    const allActivities = moodLogs.flatMap((log) => log.activities);
    const allEmotions = moodLogs.flatMap((log) => log.emotions);

    const activityCounts = allActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    const commonEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => emotion);

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalLogs: moodLogs.length,
      weeklyTrend,
      monthlyData,
      weeklyData,
      patterns: {
        bestDay: 'N/A', // Se puede implementar lógica más compleja
        worstDay: 'N/A',
        commonActivities,
        commonEmotions,
      },
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};

// ========================================
// CONFIGURACIONES
// ========================================

export const saveUserSettings = async (userId: string, settings: any) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};
