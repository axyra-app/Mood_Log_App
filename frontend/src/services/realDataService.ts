// Servicio para obtener datos reales de Firebase para análisis de IA
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc,
  getDoc,
  Timestamp 
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

export interface RealChatData {
  messages: Array<{
    content: string;
    timestamp: Date;
    sender: 'user' | 'psychologist';
    sessionId: string;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface RealCrisisData {
  recentMoodLogs: Array<{
    mood: number;
    date: Date;
    notes?: string;
    emotions?: string[];
  }>;
  recentMessages: Array<{
    content: string;
    timestamp: Date;
  }>;
  userProfile: {
    age?: number;
    hasHistoryOfCrisis?: boolean;
    riskFactors?: string[];
  };
}

// Función para obtener datos reales de estado de ánimo
export const getRealMoodData = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<RealMoodData> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const moodLogs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        mood: data.mood || 0,
        date: data.createdAt?.toDate() || new Date(),
        notes: data.notes || '',
        emotions: data.emotions || [],
        activities: data.activities || []
      };
    });

    return {
      moodLogs,
      period: { start: startDate, end: endDate }
    };
  } catch (error) {
    console.error('Error obteniendo datos de estado de ánimo:', error);
    return {
      moodLogs: [],
      period: { start: startDate, end: endDate }
    };
  }
};

// Función para obtener datos reales de conversaciones
export const getRealChatData = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<RealChatData> => {
  try {
    // Obtener sesiones de chat del usuario
    const chatSessionsRef = collection(db, 'chatSessions');
    const sessionsQuery = query(
      chatSessionsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessionIds = sessionsSnapshot.docs.map(doc => doc.id);

    // Obtener mensajes de todas las sesiones
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('sessionId', 'in', sessionIds),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc'),
      limit(100) // Limitar para evitar sobrecarga
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        content: data.content || '',
        timestamp: data.createdAt?.toDate() || new Date(),
        sender: data.senderId === userId ? 'user' : 'psychologist',
        sessionId: data.sessionId || ''
      };
    });

    return {
      messages,
      period: { start: startDate, end: endDate }
    };
  } catch (error) {
    console.error('Error obteniendo datos de conversaciones:', error);
    return {
      messages: [],
      period: { start: startDate, end: endDate }
    };
  }
};

// Función para obtener datos reales para evaluación de crisis
export const getRealCrisisData = async (
  userId: string,
  daysBack: number = 7
): Promise<RealCrisisData> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Obtener datos de estado de ánimo recientes
    const moodData = await getRealMoodData(userId, startDate, endDate);

    // Obtener mensajes recientes
    const chatData = await getRealChatData(userId, startDate, endDate);

    // Obtener perfil del usuario
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    return {
      recentMoodLogs: moodData.moodLogs,
      recentMessages: chatData.messages,
      userProfile: {
        age: userData?.age || undefined,
        hasHistoryOfCrisis: userData?.hasHistoryOfCrisis || false,
        riskFactors: userData?.riskFactors || []
      }
    };
  } catch (error) {
    console.error('Error obteniendo datos para evaluación de crisis:', error);
    return {
      recentMoodLogs: [],
      recentMessages: [],
      userProfile: {}
    };
  }
};

// Función para obtener estadísticas del usuario
export const getUserStats = async (userId: string) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Últimos 30 días

    const moodData = await getRealMoodData(userId, startDate, endDate);
    const chatData = await getRealChatData(userId, startDate, endDate);

    return {
      totalMoodLogs: moodData.moodLogs.length,
      averageMood: moodData.moodLogs.length > 0 
        ? moodData.moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodData.moodLogs.length 
        : 0,
      totalMessages: chatData.messages.length,
      period: { start: startDate, end: endDate }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    return {
      totalMoodLogs: 0,
      averageMood: 0,
      totalMessages: 0,
      period: { start: new Date(), end: new Date() }
    };
  }
};
