import { ArrowLeft, MessageCircle, Send, User, Clock, Check, CheckCheck, Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useChatSessions, useChatMessages } from '../hooks/useChat';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const PsychologistChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState<{[key: string]: boolean}>({});

  const { sessions, loading: sessionsLoading, markAsRead, createSession } = useChatSessions(user?.uid || '');
  const { messages, loading: messagesLoading, sendMessage } = useChatMessages(selectedSession);

  // Las sesiones ya vienen filtradas por psicólogo desde el hook
  const mySessions = sessions;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Escuchar cambios en el tema desde otros componentes
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setIsDarkMode(currentTheme === 'dark');
    };

    // Agregar listener para cambios de tema
    window.addEventListener('storage', handleThemeChange);
    
    // También escuchar cambios en el mismo tab
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme');
      const newDarkMode = currentTheme === 'dark';
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
        
        // Aplicar clases CSS inmediatamente
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }, 50); // Reducir intervalo para respuesta más rápida

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, [isDarkMode]);

  // Función async para manejar la selección/creación de sesión
  useEffect(() => {
    const handlePatientSession = async () => {
      // Si viene desde el dashboard con un paciente específico, seleccionarlo automáticamente
      if (location.state?.patientId && sessions.length >= 0) {
        const targetSession = sessions.find(session => 
          session.userId === location.state.patientId || 
          session.userName === location.state.patientName
        );
        
        if (targetSession) {
          // Sesión existe, seleccionarla
          setSelectedSession(targetSession.id);
          setShowChatOnMobile(true);
          toast.success(`Chat iniciado con ${targetSession.userName}`);
        } else if (location.state.patientId && user) {
          // Sesión no existe, crear una nueva
          try {
            const newSessionId = await createSession(
              location.state.patientId,
              user.uid,
              location.state.patientName || 'Usuario',
              location.state.patientEmail || ''
            );
            setSelectedSession(newSessionId);
            setShowChatOnMobile(true);
            toast.success(`Nueva conversación iniciada con ${location.state.patientName}`);
          } catch (error) {
            console.error('Error creando sesión:', error);
            toast.error('Error al crear la conversación');
          }
        }
      }
    };

    handlePatientSession();
  }, [location.state, sessions]);

  // Monitorear estado de conexión de usuarios
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    sessions.forEach(session => {
      const userRef = doc(db, 'users', session.userId);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const isOnline = userData.isOnline || false;
          const lastSeen = userData.lastSeen;
          
          // Considerar online si está marcado como online O si su última actividad fue hace menos de 5 minutos
          const now = new Date();
          const lastSeenDate = lastSeen ? (lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen)) : null;
          const isRecentlyActive = lastSeenDate && (now.getTime() - lastSeenDate.getTime()) < 5 * 60 * 1000;
          
          setUserOnlineStatus(prev => ({
            ...prev,
            [session.userId]: isOnline || isRecentlyActive
          }));
        }
      });
      
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [sessions]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || isSending || !user) return;

    try {
      setIsSending(true);
      await sendMessage(selectedSession, user.uid, user.displayName || 'Psicólogo', newMessage);
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
                onClick={() => navigate('/dashboard-psychologist')}
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
                Chat con Pacientes
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Botón móvil para mostrar/ocultar chat */}
              <button
                onClick={() => setShowChatOnMobile(!showChatOnMobile)}
                className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={showChatOnMobile ? 'Mostrar conversaciones' : 'Mostrar chat'}
              >
                {showChatOnMobile ? <Menu className='w-5 h-5' /> : <MessageCircle className='w-5 h-5' />}
              </button>

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
          <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] lg:h-[600px]">
            {/* Sessions List */}
            <div className={`w-full lg:w-1/3 border-r transition-colors duration-500 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } ${showChatOnMobile ? 'hidden lg:block' : 'block lg:block'}`}>
              <div className={`p-4 border-b transition-colors duration-500 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Conversaciones Activas
                </h2>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {mySessions.length} conversación{mySessions.length !== 1 ? 'es' : ''}
                </p>
              </div>

              <div className="overflow-y-auto h-[300px] lg:h-full">
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
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Los pacientes aparecerán aquí cuando inicien una conversación
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
                              {session.userName || 'Usuario'}
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
            <div className={`flex-1 flex flex-col ${showChatOnMobile ? 'block lg:flex' : 'hidden lg:flex'}`}>
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
                          {mySessions.find(s => s.id === selectedSession)?.userName || 'Usuario'}
                        </h3>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {(() => {
                            const currentSession = mySessions.find(s => s.id === selectedSession);
                            if (!currentSession) return 'Desconectado';
                            
                            const isOnline = userOnlineStatus[currentSession.userId];
                            return isOnline ? 'En línea' : 'Desconectado';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[300px] lg:h-full">
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
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
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
      </div>
    </div>
  );
};

export default PsychologistChat;
