import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { createChatNotification } from './useNotifications';

export interface UserChatSession {
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

export interface UserChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'system';
}

export const useUserChatSessions = (userId: string) => {
  const [sessions, setSessions] = useState<UserChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const sessionsQuery = query(
      collection(db, 'chatSessions'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      async (snapshot) => {
        try {
          const sessionsData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();

              // Obtener información del psicólogo
              const psychologistDoc = doc(db, 'psychologists', data.psychologistId);
              const psychologistSnapshot = await getDoc(psychologistDoc);
              const psychologistData = psychologistSnapshot.exists() ? psychologistSnapshot.data() : null;
              const psychologistName = psychologistData?.displayName || psychologistData?.name || 'Psicólogo';

              return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                psychologistId: data.psychologistId,
                psychologistName: psychologistName,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt?.toDate(),
                unreadCount: data.unreadCount || 0,
                isActive: data.isActive,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
              };
            })
          );

          setSessions(sessionsData);
          setError(null);
        } catch (err) {
          console.error('Error processing sessions:', err);
          setError('Error al cargar las conversaciones');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in sessions listener:', err);
        setError('Error al cargar las conversaciones');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, 'chatSessions', sessionId), {
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking session as read:', error);
    }
  };

  const createSession = async (userId: string, psychologistId: string): Promise<string> => {
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

      // Obtener información del usuario
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.exists()
        ? userSnapshot.data()
        : { displayName: 'Usuario', email: 'usuario@ejemplo.com' };

      // Crear nueva sesión
      const sessionData = {
        userId,
        userName: userData.displayName || 'Usuario',
        userEmail: userData.email || 'usuario@ejemplo.com',
        psychologistId,
        psychologistName: psychologistName,
        participants: [userId, psychologistId], // Campo requerido por las reglas
        lastMessage: '',
        lastMessageAt: null,
        unreadCount: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const sessionRef = doc(collection(db, 'chatSessions'));
      await setDoc(sessionRef, sessionData);
      return sessionRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  return {
    sessions,
    loading,
    error,
    markAsRead,
    createSession,
  };
};

export const useUserChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<UserChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const messagesQuery = query(
      collection(db, 'chatMessages'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          const messagesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              sessionId: data.sessionId,
              senderId: data.senderId,
              senderName: data.senderName,
              content: data.content,
              timestamp: data.timestamp?.toDate(),
              isRead: data.isRead,
              messageType: data.messageType || 'text',
            };
          });

          setMessages(messagesData);
          setError(null);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError('Error al cargar los mensajes');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in messages listener:', err);
        setError('Error al cargar los mensajes');
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

      await setDoc(doc(collection(db, 'chatMessages')), messageData);

      // Actualizar la sesión con el último mensaje
      await updateDoc(doc(db, 'chatSessions', sessionId), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Crear notificación para el psicólogo
      try {
        const sessionDoc = await getDoc(doc(db, 'chatSessions', sessionId));
        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();
          await createChatNotification(sessionData.psychologistId, senderId, senderName, content);
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // No lanzar error aquí para no interrumpir el envío del mensaje
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
