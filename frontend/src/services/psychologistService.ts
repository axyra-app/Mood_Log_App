import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Psychologist {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  license?: string;
  specialization: string[];
  experience: number;
  bio?: string;
  profileImage?: string;
  isAvailable: boolean;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  languages: string[];
  consultationFee?: number;
  rating: number;
  totalPatients: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  psychologistId: string;
  status: 'active' | 'waiting' | 'completed' | 'cancelled';
  startedAt: Date;
  lastMessageAt?: Date;
  messages: ChatMessage[];
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'psychologist';
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

// Obtener todos los psicólogos disponibles
export const getAvailablePsychologists = async (): Promise<Psychologist[]> => {
  try {
    console.log('🔍 Buscando psicólogos reales registrados...');
    
    // Buscar usuarios con role: 'psychologist' en la colección users
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'psychologist'));
    const querySnapshot = await getDocs(q);

    const psychologists: Psychologist[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const userData = docSnapshot.data();
        
        // Validar que tenemos los datos necesarios
        if (!userData.email || !userData.displayName) {
          console.warn('User data missing required fields:', docSnapshot.id);
          continue;
        }
        
        const psychologist: Psychologist = {
          id: docSnapshot.id,
          userId: docSnapshot.id,
          name: userData.displayName || userData.username || 'Psicólogo',
          email: userData.email || '',
          phone: userData.phone || '',
          license: userData.license || '',
          specialization: Array.isArray(userData.specialization) 
            ? userData.specialization 
            : ['Psicología General'],
          experience: userData.experience || 1,
          bio: userData.bio || 'Psicólogo profesional disponible para consultas.',
          profileImage: userData.photoURL || '',
          isAvailable: userData.isAvailable !== false,
          workingHours: userData.workingHours || { start: '09:00', end: '17:00', timezone: 'America/Bogota' },
          languages: Array.isArray(userData.languages) 
            ? userData.languages 
            : ['Español'],
          consultationFee: userData.consultationFee || 0,
          rating: userData.rating || 5.0,
          totalPatients: userData.totalPatients || 0,
          isVerified: userData.isVerified !== false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
        
        psychologists.push(psychologist);
        console.log(`✅ Psicólogo real encontrado: ${psychologist.name}`);
      } catch (error) {
        console.error('Error processing psychologist data:', error);
        // Continuar con el siguiente psicólogo
      }
    }

    console.log(`✅ Encontrados ${psychologists.length} psicólogos reales`);
    
    // Si no hay psicólogos reales, mostrar mensaje informativo
    if (psychologists.length === 0) {
      console.log('ℹ️ No hay psicólogos registrados en el sistema');
    }
    
    return psychologists;
  } catch (error) {
    console.error('❌ Error getting available psychologists:', error);
    throw error;
  }
};

// Crear nueva sesión de chat
export const createChatSession = async (userId: string, psychologistId: string): Promise<string> => {
  try {
    const chatSessionsRef = collection(db, 'chatSessions');
    const docRef = await addDoc(chatSessionsRef, {
      userId,
      psychologistId,
      status: 'waiting',
      startedAt: serverTimestamp(),
      messages: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

// Obtener sesiones de chat de un usuario
export const getUserChatSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const chatSessionsRef = collection(db, 'chatSessions');
    const q = query(
      chatSessionsRef,
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const sessions: ChatSession[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const sessionData = docSnapshot.data();
      
      const session: ChatSession = {
        id: docSnapshot.id,
        userId: sessionData.userId,
        psychologistId: sessionData.psychologistId,
        status: sessionData.status,
        startedAt: sessionData.startedAt?.toDate() || new Date(),
        lastMessageAt: sessionData.lastMessageAt?.toDate(),
        messages: sessionData.messages || [],
        notes: sessionData.notes,
        rating: sessionData.rating,
        feedback: sessionData.feedback,
      };
      
      sessions.push(session);
    }

    return sessions;
  } catch (error) {
    console.error('Error getting user chat sessions:', error);
    throw error;
  }
};

// Enviar mensaje en chat
export const sendChatMessage = async (
  sessionId: string, 
  senderId: string, 
  senderType: 'user' | 'psychologist',
  content: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Chat session not found');
    }
    
    const sessionData = sessionSnap.data();
    const messages = sessionData.messages || [];
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId,
      senderType,
      content,
      timestamp: new Date(),
      isRead: false,
      messageType: 'text',
    };
    
    messages.push(newMessage);
    
    await updateDoc(sessionRef, {
      messages,
      lastMessageAt: serverTimestamp(),
      status: 'active',
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// Suscribirse a mensajes de una sesión de chat
export const subscribeToChatMessages = (
  sessionId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const sessionRef = doc(db, 'chatSessions', sessionId);
  
  return onSnapshot(sessionRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const sessionData = docSnapshot.data();
      const messages = sessionData.messages || [];
      callback(messages);
    } else {
      callback([]);
    }
  });
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (sessionId: string, userId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) return;
    
    const sessionData = sessionSnap.data();
    const messages = sessionData.messages || [];
    
    // Marcar mensajes del psicólogo como leídos
    const updatedMessages = messages.map((msg: ChatMessage) => {
      if (msg.senderId !== userId && !msg.isRead) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    
    await updateDoc(sessionRef, {
      messages: updatedMessages,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Finalizar sesión de chat
export const endChatSession = async (
  sessionId: string, 
  rating?: number, 
  feedback?: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'completed',
      rating,
      feedback,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error ending chat session:', error);
    throw error;
  }
};

// Registrar nuevo psicólogo
export const registerPsychologist = async (
  userId: string,
  psychologistData: Omit<Psychologist, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const psychologistsRef = collection(db, 'psychologists');
    const docRef = await addDoc(psychologistsRef, {
      ...psychologistData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering psychologist:', error);
    throw error;
  }
};
