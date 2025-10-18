import { useState, useEffect, useCallback } from 'react';
import { chatHistoryService, ChatMessage, ChatSession } from '../services/chatHistoryService';

interface UseChatHistoryProps {
  userId: string;
  psychologistId?: string;
  sessionId?: string;
  chatType?: 'ai-chat' | 'psychologist-chat';
}

export const useChatHistory = (userId: string, chatType: 'ai-chat' | 'psychologist-chat' = 'ai-chat', psychologistId?: string, sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      } else if (psychologistId && chatType === 'psychologist-chat') {
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
  }, [userId, psychologistId, sessionId, chatType]);

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

  // Enviar mensaje (simplificado para la burbuja flotante)
  const sendMessage = useCallback(async (message: string, sender: 'user' | 'ai' | 'psychologist' = 'user') => {
    if (!userId || !message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentSessionId = sessionId || chatHistoryService.generateSessionId(userId, psychologistId);
      
      const messageId = await chatHistoryService.saveMessage({
        userId,
        psychologistId,
        message: message.trim(),
        sender,
        sessionId: currentSessionId,
        messageType: 'text',
      });

      // Actualizar mensajes localmente
      const newMessage: ChatMessage = {
        id: messageId,
        userId,
        psychologistId,
        message: message.trim(),
        sender,
        sessionId: currentSessionId,
        messageType: 'text',
        timestamp: new Date(),
        isRead: true,
      };

      setMessages(prev => [...prev, newMessage]);
      
      return messageId;
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, psychologistId, sessionId]);

  // Guardar mensaje (método original)
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
      await chatHistoryService.cleanupOldMessages(userId);
    } catch (err) {
      console.error('Error cleaning up old messages:', err);
    }
  }, [userId]);

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
    isLoading,
    error,
    sendMessage,
    saveMessage,
    createSession,
    loadMessages,
    loadSessions,
    cleanupOldMessages,
  };
};
