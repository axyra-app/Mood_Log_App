import { ArrowLeft, MessageCircle, Send, User, Clock, Check, CheckCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useUserChatSessions, useUserChatMessages } from '../hooks/useUserChat';

const UserChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [availablePsychologists, setAvailablePsychologists] = useState<any[]>([]);

  const { sessions, loading: sessionsLoading, markAsRead, createSession } = useUserChatSessions(user?.uid || '');
  const { messages, loading: messagesLoading, sendMessage } = useUserChatMessages(selectedSession);

  // Filtrar sesiones donde el usuario actual es el usuario
  const mySessions = sessions.filter(session => session.userId === user?.uid);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Cargar psicólogos disponibles
    const loadPsychologists = async () => {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        
        const psychologistsQuery = query(
          collection(db, 'psychologists')
        );
        
        const snapshot = await getDocs(psychologistsQuery);
        const psychologists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAvailablePsychologists(psychologists);
      } catch (error) {
        console.error('Error loading psychologists:', error);
      }
    };

    loadPsychologists();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || isSending || !user) return;

    try {
      setIsSending(true);
      await sendMessage(selectedSession, user.uid, user.displayName || 'Usuario', newMessage);
      setNewMessage('');
      
      // Marcar sesión como leída
      await markAsRead(selectedSession);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startChatWithPsychologist = async (psychologistId: string) => {
    if (!user) return;

    try {
      const sessionId = await createSession(user.uid, psychologistId);
      setSelectedSession(sessionId);
      toast.success('Conversación iniciada');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Error al iniciar la conversación');
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Chat con Psicólogos
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`rounded-xl shadow-sm border transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex h-[600px]">
            {/* Sessions List */}
            <div className={`w-1/3 border-r transition-colors duration-500 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`p-4 border-b transition-colors duration-500 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Mis Conversaciones
                </h2>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {mySessions.length} conversación{mySessions.length !== 1 ? 'es' : ''}
                </p>
              </div>

              <div className="overflow-y-auto h-full">
                {sessionsLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Cargando conversaciones...
                    </p>
                  </div>
                ) : mySessions.length === 0 ? (
                  <div className="p-4 text-center">
                    <MessageCircle className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No hay conversaciones activas
                    </p>
                    <p className={`text-xs transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Selecciona un psicólogo para comenzar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {mySessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session.id)}
                        className={`p-4 cursor-pointer transition-colors duration-300 ${
                          selectedSession === session.id
                            ? isDarkMode
                              ? 'bg-purple-600'
                              : 'bg-purple-50 border-r-2 border-purple-500'
                            : isDarkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate transition-colors duration-500 ${
                              selectedSession === session.id
                                ? 'text-white'
                                : isDarkMode
                                ? 'text-white'
                                : 'text-gray-900'
                            }`}>
                              {session.psychologistName || 'Psicólogo'}
                            </p>
                            <p className={`text-xs truncate transition-colors duration-500 ${
                              selectedSession === session.id
                                ? 'text-purple-100'
                                : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}>
                              {session.lastMessage || 'Sin mensajes'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs transition-colors duration-500 ${
                              selectedSession === session.id
                                ? 'text-purple-100'
                                : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}>
                              {session.lastMessageAt ? formatTime(session.lastMessageAt) : ''}
                            </p>
                            {session.unreadCount > 0 && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                {session.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedSession ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b transition-colors duration-500 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-medium transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {mySessions.find(s => s.id === selectedSession)?.psychologistName || 'Psicólogo'}
                        </h3>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          En línea
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Cargando mensajes...
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No hay mensajes en esta conversación
                        </p>
                        <p className={`text-xs transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Envía un mensaje para comenzar
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.uid
                              ? isDarkMode
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-500 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              message.senderId === user?.uid ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.senderId === user?.uid && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 border-t transition-colors duration-500 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje..."
                        className={`flex-1 px-4 py-2 border rounded-lg transition-colors duration-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className={`w-16 h-16 mx-auto mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Selecciona una conversación
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Psychologists */}
        {mySessions.length === 0 && (
          <div className={`mt-6 p-6 rounded-xl shadow-sm border transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Psicólogos Disponibles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePsychologists.map((psychologist) => (
                <div
                  key={psychologist.id}
                  className={`p-4 rounded-lg border transition-colors duration-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {psychologist.displayName || 'Psicólogo'}
                      </h4>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {psychologist.specialization || 'Especialista'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startChatWithPsychologist(psychologist.id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Iniciar Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;
