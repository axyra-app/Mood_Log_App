import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Psychologist, 
  ChatSession, 
  ChatMessage,
  getAvailablePsychologists,
  createChatSession,
  getUserChatSessions,
  sendChatMessage,
  subscribeToChatMessages,
  markMessagesAsRead,
  endChatSession
} from '../services/psychologistService';

export const usePsychologists = () => {
  const { user } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available psychologists
  const loadPsychologists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const psychologistsData = await getAvailablePsychologists();
      setPsychologists(psychologistsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading psychologists');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    loadPsychologists();
  }, [loadPsychologists]);

  return {
    psychologists,
    loading,
    error,
    loadPsychologists,
  };
};

export const useChatSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user chat sessions
  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const sessionsData = await getUserChatSessions(user.uid);
      setSessions(sessionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chat sessions');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Create new chat session
  const createSession = useCallback(async (psychologistId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      const sessionId = await createChatSession(user.uid, psychologistId);
      await loadSessions();
      return sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating chat session');
      throw err;
    }
  }, [user?.uid, loadSessions]);

  // Send message
  const sendMessage = useCallback(async (sessionId: string, content: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      await sendChatMessage(sessionId, user.uid, 'user', content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      throw err;
    }
  }, [user?.uid]);

  // Mark messages as read
  const markAsRead = useCallback(async (sessionId: string) => {
    if (!user?.uid) return;

    try {
      await markMessagesAsRead(sessionId, user.uid);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user?.uid]);

  // End chat session
  const endSession = useCallback(async (sessionId: string, rating?: number, feedback?: string) => {
    try {
      await endChatSession(sessionId, rating, feedback);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ending chat session');
      throw err;
    }
  }, [loadSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    createSession,
    sendMessage,
    markAsRead,
    endSession,
    refreshSessions: loadSessions,
  };
};

export const useChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToChatMessages(sessionId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  return {
    messages,
    loading,
    error,
  };
};
