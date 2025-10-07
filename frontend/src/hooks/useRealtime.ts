import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

// Hook para actualizaciones en tiempo real de citas
export const useRealtimeAppointments = (userId: string) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      orderBy('appointmentDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        appointmentDate: doc.data().appointmentDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      
      setAppointments(appointmentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { appointments, loading };
};

// Hook para actualizaciones en tiempo real de chats
export const useRealtimeChats = (userId: string) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { chats, loading };
};

// Hook para actualizaciones en tiempo real de mensajes
export const useRealtimeMessages = (chatId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading };
};

// Hook para actualizaciones en tiempo real de mood logs
export const useRealtimeMoodLogs = (userId: string) => {
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(
      moodLogsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moodLogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      
      setMoodLogs(moodLogsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { moodLogs, loading };
};

// Hook para actualizaciones en tiempo real de psicólogos
export const useRealtimePsychologists = () => {
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const psychologistsRef = collection(db, 'psychologists');
    const q = query(psychologistsRef, where('isAvailable', '==', true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const psychologistsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
      
      setPsychologists(psychologistsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { psychologists, loading };
};
