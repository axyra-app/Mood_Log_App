import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, setDoc, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId: string;
  psychologistName: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'system';
}

export const useChatSessions = (psychologistId: string) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    const sessionsQuery = query(
      collection(db, 'chatSessions'),
      where('psychologistId', '==', psychologistId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(sessionsQuery, 
      async (snapshot) => {
        try {
          const sessionsData: ChatSession[] = [];
          
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            
            // Obtener información del usuario
            const userQuery = query(
              collection(db, 'users'),
              where('__name__', '==', data.userId),
              limit(1)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              
              sessionsData.push({
                id: docSnapshot.id,
                userId: data.userId,
                userName: userData.displayName || userData.username || 'Usuario',
                userEmail: userData.email || '',
                psychologistId: data.psychologistId,
                psychologistName: data.psychologistName || '',
                lastMessage: data.lastMessage || '',
                lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : new Date(data.lastMessageAt),
                unreadCount: data.unreadCount || 0,
                isActive: data.isActive !== false,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              });
            }
          }
          
          setSessions(sessionsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching chat sessions:', err);
          setError('Error al cargar las conversaciones');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in chat sessions listener:', err);
        setError('Error en la conexión de chat');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [psychologistId]);

  const createSession = async (userId: string, psychologistId: string) => {
    try {
      // Verificar si ya existe una sesión
      const existingQuery = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        where('psychologistId', '==', psychologistId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        return existingSnapshot.docs[0].id;
      }

      // Obtener información del psicólogo
      const psychologistQuery = query(
        collection(db, 'users'),
        where('__name__', '==', psychologistId),
        limit(1)
      );
      const psychologistSnapshot = await getDocs(psychologistQuery);
      const psychologistName = psychologistSnapshot.empty ? 'Psicólogo' : psychologistSnapshot.docs[0].data().displayName;

      // Crear nueva sesión
      const sessionData = {
        userId,
        psychologistId,
        psychologistName,
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const sessionRef = doc(collection(db, 'chatSessions'));
      await setDoc(sessionRef, sessionData);
      
      return sessionRef.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  };

  const markAsRead = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking session as read:', error);
    }
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    markAsRead,
  };
};

export const useChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesQuery = query(
      collection(db, 'chatMessages'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery,
      (snapshot) => {
        try {
          const messagesData: ChatMessage[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              sessionId: data.sessionId,
              senderId: data.senderId,
              senderName: data.senderName || 'Usuario',
              content: data.content,
              timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
              isRead: data.isRead || false,
              messageType: data.messageType || 'text',
            };
          });
          
          setMessages(messagesData);
          setError(null);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Error al cargar los mensajes');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in messages listener:', err);
        setError('Error en la conexión de mensajes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const sendMessage = async (sessionId: string, senderId: string, senderName: string, content: string) => {
    try {
      const messageData = {
        sessionId,
        senderId,
        senderName,
        content,
        timestamp: serverTimestamp(),
        isRead: false,
        messageType: 'text',
      };

      const messageRef = doc(collection(db, 'chatMessages'));
      await setDoc(messageRef, messageData);

      // Actualizar la sesión con el último mensaje
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'chatMessages', messageId);
      await updateDoc(messageRef, {
        isRead: true,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    markMessageAsRead,
  };
};
