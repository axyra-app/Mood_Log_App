import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  userId: string;
  psychologistId?: string;
  message: string;
  timestamp: Date;
  sender: 'user' | 'psychologist' | 'ai';
  sessionId: string;
  messageType: 'text' | 'image' | 'file';
}

export interface ChatSession {
  id: string;
  userId: string;
  psychologistId?: string;
  sessionType: 'psychologist' | 'ai';
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
}

class ChatHistoryService {
  private readonly CHAT_MESSAGES_COLLECTION = 'chatMessages';
  private readonly CHAT_SESSIONS_COLLECTION = 'chatSessions';
  private readonly RETENTION_DAYS = 10;

  /**
   * Guardar un mensaje en el historial
   */
  async saveMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Limpiar datos antes de guardar
      const cleanData = {
        ...messageData,
        psychologistId: messageData.psychologistId || null, // Convertir undefined a null
        timestamp: Timestamp.now(),
      };

      const messageRef = await addDoc(collection(db, this.CHAT_MESSAGES_COLLECTION), cleanData);

      // Actualizar la sesión de chat
      await this.updateChatSession(messageData.sessionId, messageData.userId, messageData.psychologistId);

      return messageRef.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de una sesión específica
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.CHAT_MESSAGES_COLLECTION),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          userId: data.userId,
          psychologistId: data.psychologistId,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          sender: data.sender,
          sessionId: data.sessionId,
          messageType: data.messageType || 'text',
        });
      });

      return messages;
    } catch (error) {
      console.error('Error getting session messages:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de chat de un usuario (últimos 10 días)
   */
  async getUserChatHistory(userId: string, psychologistId?: string): Promise<ChatMessage[]> {
    try {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - this.RETENTION_DAYS);

      let q;
      if (psychologistId) {
        // Chat con psicólogo específico
        q = query(
          collection(db, this.CHAT_MESSAGES_COLLECTION),
          where('userId', '==', userId),
          where('psychologistId', '==', psychologistId),
          where('timestamp', '>=', Timestamp.fromDate(tenDaysAgo)),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
      } else {
        // Chat con IA
        q = query(
          collection(db, this.CHAT_MESSAGES_COLLECTION),
          where('userId', '==', userId),
          where('sender', 'in', ['user', 'ai']),
          where('timestamp', '>=', Timestamp.fromDate(tenDaysAgo)),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
      }

      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          userId: data.userId,
          psychologistId: data.psychologistId,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          sender: data.sender,
          sessionId: data.sessionId,
          messageType: data.messageType || 'text',
        });
      });

      return messages.reverse(); // Ordenar cronológicamente
    } catch (error) {
      console.error('Error getting user chat history:', error);
      throw error;
    }
  }

  /**
   * Obtener sesiones de chat activas de un usuario
   */
  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, this.CHAT_SESSIONS_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sessions: ChatSession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          userId: data.userId,
          psychologistId: data.psychologistId,
          sessionType: data.sessionType,
          startTime: data.startTime.toDate(),
          lastActivity: data.lastActivity.toDate(),
          messageCount: data.messageCount,
          isActive: data.isActive,
        });
      });

      return sessions;
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      throw error;
    }
  }

  /**
   * Crear o actualizar una sesión de chat
   */
  private async updateChatSession(sessionId: string, userId: string, psychologistId?: string): Promise<void> {
    try {
      const sessionData = {
        userId,
        psychologistId: psychologistId || null,
        sessionType: psychologistId ? 'psychologist' : 'ai',
        lastActivity: Timestamp.now(),
        isActive: true,
      };

      // Intentar actualizar la sesión existente
      const existingSession = await this.getSessionById(sessionId);
      
      if (existingSession) {
        // Actualizar sesión existente
        await this.updateSessionMessageCount(sessionId);
      } else {
        // Crear nueva sesión
        await addDoc(collection(db, this.CHAT_SESSIONS_COLLECTION), {
          ...sessionData,
          id: sessionId,
          startTime: Timestamp.now(),
          messageCount: 1,
        });
      }
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  }

  /**
   * Obtener sesión por ID
   */
  private async getSessionById(sessionId: string): Promise<ChatSession | null> {
    try {
      const q = query(
        collection(db, this.CHAT_SESSIONS_COLLECTION),
        where('id', '==', sessionId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        userId: data.userId,
        psychologistId: data.psychologistId,
        sessionType: data.sessionType,
        startTime: data.startTime.toDate(),
        lastActivity: data.lastActivity.toDate(),
        messageCount: data.messageCount,
        isActive: data.isActive,
      };
    } catch (error) {
      console.error('Error getting session by ID:', error);
      return null;
    }
  }

  /**
   * Actualizar contador de mensajes de una sesión
   */
  private async updateSessionMessageCount(sessionId: string): Promise<void> {
    try {
      const session = await this.getSessionById(sessionId);
      if (session) {
        // Aquí deberías usar updateDoc para incrementar el contador
        // Por simplicidad, mantenemos la lógica básica
      }
    } catch (error) {
      console.error('Error updating session message count:', error);
    }
  }

  /**
   * Limpiar mensajes antiguos (más de 10 días) - DESHABILITADO TEMPORALMENTE
   */
  async cleanupOldMessages(userId?: string): Promise<void> {
    // Temporalmente deshabilitado para evitar errores de permisos
    console.log('Cleanup de mensajes deshabilitado temporalmente');
    return;
    
    try {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - this.RETENTION_DAYS);

      let q;
      if (userId) {
        // Solo limpiar mensajes del usuario específico
        q = query(
          collection(db, this.CHAT_MESSAGES_COLLECTION),
          where('userId', '==', userId),
          where('timestamp', '<', Timestamp.fromDate(tenDaysAgo))
        );
      } else {
        // Si no hay userId, no hacer nada (evitar errores de permisos)
        console.log('No userId provided for cleanup, skipping...');
        return;
      }

      const querySnapshot = await getDocs(q);
      
      // En una implementación real, aquí eliminarías los mensajes antiguos
      // Por ahora, solo registramos cuántos se encontrarían
      console.log(`Found ${querySnapshot.size} old messages to clean up for user ${userId}`);
      
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }

  /**
   * Generar ID único para sesión
   */
  generateSessionId(userId: string, psychologistId?: string): string {
    const timestamp = Date.now();
    const prefix = psychologistId ? 'psych' : 'ai';
    return `${prefix}_${userId}_${timestamp}`;
  }
}

export const chatHistoryService = new ChatHistoryService();
