import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { createPsychologistChatNotification } from './useNotifications';

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

    const unsubscribe = onSnapshot(
      sessionsQuery,
      async (snapshot) => {
        try {
          const sessionsData: ChatSession[] = [];

          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();

            // Obtener información del usuario
            const userDoc = doc(db, 'users', data.userId);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();

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
      const psychologistDoc = doc(db, 'psychologists', psychologistId);
      const psychologistSnapshot = await getDoc(psychologistDoc);
      const psychologistData = psychologistSnapshot.exists() ? psychologistSnapshot.data() : null;
      const psychologistName = psychologistData?.displayName || psychologistData?.name || 'Psicólogo';

      // Crear nueva sesión
      const sessionData = {
        userId,
        psychologistId,
        psychologistName,
        participants: [userId, psychologistId], // Campo requerido por las reglas
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
      where('sessionId', '==', sessionId)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          const messagesData: ChatMessage[] = snapshot.docs.map((doc) => {
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

          // Ordenar mensajes por timestamp
          messagesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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
      console.log('📤 Enviando mensaje:', { sessionId, senderId, senderName, content });
      
      const messageData = {
        sessionId,
        senderId,
        senderName,
        content,
        timestamp: serverTimestamp(),
        isRead: false,
        messageType: 'text',
      };

      const messageRef = await addDoc(collection(db, 'chatMessages'), messageData);
      console.log('📤 Mensaje enviado con ID:', messageRef.id);

      // Actualizar la sesión con el último mensaje
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('📤 Sesión actualizada');

      // Crear notificación para el usuario SOLO si el mensaje viene del psicólogo
      try {
        const sessionDoc = await getDoc(sessionRef);
        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();
          // Solo crear notificación si el mensaje viene del psicólogo (no del usuario)
          if (senderId !== sessionData.userId) {
            await createPsychologistChatNotification(sessionData.userId, senderId, senderName, content);
            console.log('📤 Notificación creada para usuario');
          } else {
            console.log('📤 No se crea notificación - mensaje del propio usuario');
          }
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // No lanzar error aquí para no interrumpir el envío del mensaje
      }

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
