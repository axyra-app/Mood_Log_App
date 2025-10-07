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
import { initializeDefaultPsychologists } from './psychologistDefaultData';
import { cleanupCorruptedPsychologists, checkPsychologistsHealth } from './psychologistCleanup';

// Función de respaldo para psicólogos en memoria
const getFallbackPsychologists = (): Psychologist[] => {
  console.log('🔄 Creando psicólogos de respaldo en memoria...');
  
  const fallbackPsychologists: Psychologist[] = [
    {
      id: 'fallback-1',
      userId: 'default-psychologist-1',
      name: 'Dra. María González',
      email: 'maria.gonzalez@moodlogapp.com',
      phone: '+57 300 123 4567',
      license: 'PSI-001234',
      specialization: ['Psicología Clínica', 'Terapia Cognitivo-Conductual'],
      experience: 8,
      bio: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 8 años de experiencia. Me enfoco en ayudar a las personas a desarrollar estrategias efectivas para manejar la ansiedad, depresión y estrés.',
      profileImage: '',
      isAvailable: true,
      workingHours: { start: '09:00', end: '17:00', timezone: 'America/Bogota' },
      languages: ['Español', 'Inglés'],
      consultationFee: 150000,
      rating: 4.8,
      totalPatients: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'fallback-2',
      userId: 'default-psychologist-2',
      name: 'Dr. Carlos Rodríguez',
      email: 'carlos.rodriguez@moodlogapp.com',
      phone: '+57 300 234 5678',
      license: 'PSI-002345',
      specialization: ['Psicología Organizacional', 'Coaching'],
      experience: 6,
      bio: 'Psicólogo organizacional y coach certificado. Especializado en desarrollo personal, manejo del estrés laboral y mejora del rendimiento profesional.',
      profileImage: '',
      isAvailable: true,
      workingHours: { start: '08:00', end: '18:00', timezone: 'America/Bogota' },
      languages: ['Español'],
      consultationFee: 120000,
      rating: 4.6,
      totalPatients: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'fallback-3',
      userId: 'default-psychologist-3',
      name: 'Dra. Ana Martínez',
      email: 'ana.martinez@moodlogapp.com',
      phone: '+57 300 345 6789',
      license: 'PSI-003456',
      specialization: ['Psicología Infantil', 'Terapia Familiar'],
      experience: 10,
      bio: 'Psicóloga infantil y familiar con amplia experiencia en terapia con niños, adolescentes y familias. Especializada en problemas de comportamiento y desarrollo emocional.',
      profileImage: '',
      isAvailable: true,
      workingHours: { start: '10:00', end: '19:00', timezone: 'America/Bogota' },
      languages: ['Español'],
      consultationFee: 180000,
      rating: 4.9,
      totalPatients: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  console.log(`✅ ${fallbackPsychologists.length} psicólogos de respaldo creados en memoria`);
  return fallbackPsychologists;
};

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
    const psychologistsRef = collection(db, 'psychologists');
    
    // Temporalmente obtener todos los psicólogos sin filtros complejos
    // hasta que se construyan los índices
    console.log('🔍 Obteniendo psicólogos (modo temporal sin índices)...');
    const q = query(psychologistsRef);
    const querySnapshot = await getDocs(q);

    const psychologists: Psychologist[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const psychologistData = docSnapshot.data();
        
        // Validar que tenemos userId
        if (!psychologistData.userId) {
          console.warn('Psychologist data missing userId:', docSnapshot.id, 'Skipping...');
          continue; // Saltar este psicólogo
        }
        
        // Obtener datos del usuario
        const userRef = doc(db, 'users', psychologistData.userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          const psychologist: Psychologist = {
          id: docSnapshot.id,
          userId: psychologistData.userId,
          name: psychologistData.name || userData.displayName || userData.username || 'Psicólogo',
          email: psychologistData.email || userData.email || '',
          phone: psychologistData.phone || userData.phone || '',
          license: psychologistData.license || '',
          specialization: Array.isArray(psychologistData.specialization) 
            ? psychologistData.specialization 
            : ['Psicología General'],
          experience: psychologistData.experience || 1,
          bio: psychologistData.bio || 'Psicólogo profesional disponible para consultas.',
          profileImage: psychologistData.profileImage || userData.photoURL || '',
          isAvailable: psychologistData.isAvailable !== false, // Default true si no está definido
          workingHours: psychologistData.workingHours || { start: '09:00', end: '17:00', timezone: 'America/Bogota' },
          languages: Array.isArray(psychologistData.languages) 
            ? psychologistData.languages 
            : ['Español'],
          consultationFee: psychologistData.consultationFee || 0,
          rating: psychologistData.rating || 5.0,
          totalPatients: psychologistData.totalPatients || 0,
          isVerified: psychologistData.isVerified !== false, // Default true si no está definido
          createdAt: psychologistData.createdAt?.toDate() || new Date(),
          updatedAt: psychologistData.updatedAt?.toDate() || new Date(),
        };
        
        psychologists.push(psychologist);
        }
      } catch (error) {
        console.error('Error processing psychologist data:', error);
        // Continuar con el siguiente psicólogo
      }
    }

    console.log(`✅ Encontrados ${psychologists.length} psicólogos`);
    
    // Si no hay psicólogos válidos, inicializar datos por defecto
    if (psychologists.length === 0) {
      console.log('🔄 No se encontraron psicólogos válidos, verificando datos corruptos...');
      
      try {
        // Verificar si hay datos corruptos
        const healthCheck = await checkPsychologistsHealth();
        
        if (healthCheck.corrupted > 0) {
          console.log(`🧹 Se encontraron ${healthCheck.corrupted} psicólogos corruptos, limpiando...`);
          await cleanupCorruptedPsychologists();
        }
        
        // Intentar inicializar datos por defecto
        const defaultPsychologists = await initializeDefaultPsychologists();
        return defaultPsychologists;
      } catch (error) {
        console.error('❌ Error inicializando psicólogos por defecto:', error);
        
        // Fallback: retornar psicólogos en memoria si Firebase falla
        console.log('🔄 Usando psicólogos de respaldo en memoria...');
        return getFallbackPsychologists();
      }
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
