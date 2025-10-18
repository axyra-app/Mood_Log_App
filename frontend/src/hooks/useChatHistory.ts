import { useState, useEffect, useCallback } from 'react';
import { chatHistoryService, ChatMessage, ChatSession } from '../services/chatHistoryService';

interface UseChatHistoryProps {
  userId: string;
  psychologistId?: string;
  sessionId?: string;
}

export const useChatHistory = ({ userId, psychologistId, sessionId }: UseChatHistoryProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial de mensajes
  const loadMessages = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      let messagesData: ChatMessage[];

      if (sessionId) {
        // Cargar mensajes de una sesión específica
        messagesData = await chatHistoryService.getSessionMessages(sessionId);
      } else if (psychologistId) {
        // Cargar historial con psicólogo específico
        messagesData = await chatHistoryService.getUserChatHistory(userId, psychologistId);
      } else {
        // Cargar historial con IA
        messagesData = await chatHistoryService.getUserChatHistory(userId);
      }

      setMessages(messagesData);
    } catch (err) {
      setError('Error al cargar el historial de chat');
      console.error('Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, psychologistId, sessionId]);

  // Cargar sesiones de chat
  const loadSessions = useCallback(async () => {
    if (!userId) return;

    try {
      const sessionsData = await chatHistoryService.getUserChatSessions(userId);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  }, [userId]);

  // Guardar mensaje
  const saveMessage = useCallback(async (messageData: {
    message: string;
    sender: 'user' | 'psychologist' | 'ai';
    sessionId: string;
    messageType?: 'text' | 'image' | 'file';
  }) => {
    try {
      const messageId = await chatHistoryService.saveMessage({
        userId,
        psychologistId,
        message: messageData.message,
        sender: messageData.sender,
        sessionId: messageData.sessionId,
        messageType: messageData.messageType || 'text',
      });

      // Recargar mensajes después de guardar
      await loadMessages();
      
      return messageId;
    } catch (err) {
      setError('Error al guardar el mensaje');
      console.error('Error saving message:', err);
      throw err;
    }
  }, [userId, psychologistId, loadMessages]);

  // Generar nueva sesión
  const createSession = useCallback(() => {
    return chatHistoryService.generateSessionId(userId, psychologistId);
  }, [userId, psychologistId]);

  // Limpiar mensajes antiguos
  const cleanupOldMessages = useCallback(async () => {
    try {
      await chatHistoryService.cleanupOldMessages();
    } catch (err) {
      console.error('Error cleaning up old messages:', err);
    }
  }, []);

  // Efectos
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Limpiar mensajes antiguos al montar el componente
  useEffect(() => {
    cleanupOldMessages();
  }, [cleanupOldMessages]);

  return {
    messages,
    sessions,
    loading,
    error,
    saveMessage,
    createSession,
    loadMessages,
    loadSessions,
    cleanupOldMessages,
  };
};
