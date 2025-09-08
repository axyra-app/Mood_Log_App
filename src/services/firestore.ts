import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaces
export interface MoodLog {
  id?: string;
  userId: string;
  mood: number;
  emotions: string[];
  activities: string[];
  notes?: string;
  timestamp: Timestamp;
  aiAnalysis?: any;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'psychologist';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Psychologist {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'psychologist';
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  rating: number;
  patientsCount: number;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Chat {
  id?: string;
  userId: string;
  psychologistId: string;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'user' | 'psychologist';
  content: string;
  timestamp: Timestamp;
  read: boolean;
}

// Funciones de Firestore con manejo de errores
export const createUser = async (userData: Partial<User>): Promise<void> => {
  try {
    if (!userData.uid) throw new Error('User ID is required');
    
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const docRef = await addDoc(moodLogsRef, {
      ...moodLog,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving mood log:', error);
    throw error;
  }
};

export const getMoodLogs = async (userId: string, limitCount: number = 50): Promise<MoodLog[]> => {
  try {
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MoodLog[];
  } catch (error) {
    console.error('Error getting mood logs:', error);
    throw error;
  }
};

export const getPsychologists = async (): Promise<Psychologist[]> => {
  try {
    const psychologistsRef = collection(db, 'psychologists');
    const q = query(psychologistsRef, where('isAvailable', '==', true));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Psychologist[];
  } catch (error) {
    console.error('Error getting psychologists:', error);
    throw error;
  }
};

export const createChat = async (chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const chatsRef = collection(db, 'chats');
    const docRef = await addDoc(chatsRef, {
      ...chatData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const sendMessage = async (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');
    
    await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp()
    });
    
    // Actualizar timestamp del chat
    await updateDoc(chatRef, {
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Función para verificar la conexión a Firestore
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    const testRef = collection(db, 'test');
    await getDocs(testRef);
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};