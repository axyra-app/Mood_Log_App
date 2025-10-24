import { ArrowLeft, Menu, MessageCircle, Send, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from '../components/NotificationsPanel';
import { useAuth } from '../contexts/AuthContext';
import { useAvailablePsychologists } from '../hooks/useAvailablePsychologists';
import { useUserChatMessages, useUserChatSessions } from '../hooks/useUserChat';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const UserChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [availablePsychologists, setAvailablePsychologists] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [psychologistOnlineStatus, setPsychologistOnlineStatus] = useState<{[key: string]: boolean}>({});
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { sessions, loading: sessionsLoading, markAsRead, createSession } = useUserChatSessions(user?.uid || '');
  const { messages, loading: messagesLoading, sendMessage, deleteMessage } = useUserChatMessages(selectedSession);
  const { psychologists: availablePsychs, loading: psychologistsLoading } = useAvailablePsychologists();

  // Filtrar sesiones donde el usuario actual es el usuario
  const mySessions = sessions.filter((session) => session.userId === user?.uid);

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

  // Monitorear estado de conexión de psicólogos
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    sessions.forEach(session => {
      const psychologistRef = doc(db, 'psychologists', session.psychologistId);
      const unsubscribe = onSnapshot(psychologistRef, (doc) => {
        if (doc.exists()) {
          const psychologistData = doc.data();
          const isOnline = psychologistData.isOnline || false;
          const lastActive = psychologistData.lastActive;
          
          // Considerar online si está marcado como online O si su última actividad fue hace menos de 5 minutos
          const now = new Date();
          const lastActiveDate = lastActive ? (lastActive.toDate ? lastActive.toDate() : new Date(lastActive)) : null;
          const isRecentlyActive = lastActiveDate && (now.getTime() - lastActiveDate.getTime()) < 5 * 60 * 1000;
          
          setPsychologistOnlineStatus(prev => ({
            ...prev,
            [session.psychologistId]: isOnline || isRecentlyActive
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

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success('Mensaje eliminado');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar mensaje');
    }
  };

  const startChatWithPsychologist = async (psychologistId: string) => {
    if (!user || isCreatingChat) return;

    try {
      setIsCreatingChat(true);
      const sessionId = await createSession(user.uid, psychologistId);
      setSelectedSession(sessionId);
      setShowChatOnMobile(true);
      toast.success('Conversación iniciada');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Error al iniciar la conversación');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
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
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header
        className={`border-b transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
              <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                <MessageCircle className='w-5 h-5 text-white' />
              </div>
              <h1
                className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Chat con Psicólogos
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Notificaciones */}
              <NotificationsPanel isDarkMode={isDarkMode} />

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

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div
          className={`rounded-xl shadow-sm border transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className='flex flex-col lg:flex-row h-[calc(100vh-200px)] lg:h-[600px]'>
            {/* Sessions List - Responsive */}
            <div
              className={`w-full lg:w-1/3 border-r transition-colors duration-500 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } ${showChatOnMobile ? 'hidden lg:block' : 'block lg:block'}`}
            >
              <div
                className={`p-4 border-b transition-colors duration-500 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <h2
                      className={`text-lg font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Mis Conversaciones
                    </h2>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {mySessions.length} conversación{mySessions.length !== 1 ? 'es' : ''}
                    </p>
                  </div>

                  {/* Botón para iniciar nueva conversación */}
                  <button
                    onClick={() => {
                      if (availablePsychs.length > 0 && !isCreatingChat) {
                        startChatWithPsychologist(availablePsychs[0].userId);
                      } else if (!isCreatingChat) {
                        toast.error('No hay psicólogos disponibles en este momento');
                      }
                    }}
                    disabled={psychologistsLoading || availablePsychs.length === 0 || isCreatingChat}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors duration-300 ${
                      psychologistsLoading || availablePsychs.length === 0 || isCreatingChat
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {psychologistsLoading ? 'Cargando...' : isCreatingChat ? 'Creando...' : `Nuevo Chat`}
                  </button>
                </div>
              </div>

              <div className='overflow-y-auto h-[300px] lg:h-full'>
                {sessionsLoading ? (
                  <div className='p-4 text-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2'></div>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Cargando conversaciones...
                    </p>
                  </div>
                ) : mySessions.length === 0 ? (
                  <div className='p-4'>
                    <div className='text-center mb-4'>
                      <MessageCircle
                        className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      />
                      <p
                        className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        No tienes conversaciones aún
                      </p>
                      <p
                        className={`text-xs mt-1 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        Inicia una conversación con un psicólogo
                      </p>
                    </div>
                    
                    {/* Lista de psicólogos disponibles */}
                    {availablePsychs.length > 0 && (
                      <div className='mt-4'>
                        <h3
                          className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Psicólogos Disponibles:
                        </h3>
                        <div className='space-y-2'>
                          {availablePsychs.slice(0, 3).map((psychologist) => (
                            <div
                              key={psychologist.id}
                              onClick={() => startChatWithPsychologist(psychologist.userId)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
                                isDarkMode
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p
                                    className={`text-sm font-medium ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                                  >
                                    {psychologist.displayName}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                  >
                                    {psychologist.specialization}
                                  </p>
                                </div>
                                <div className='flex items-center space-x-2'>
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      psychologist.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                                  >
                                    {psychologist.isOnline ? 'En línea' : 'Desconectado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                    {mySessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session.id);
                          setShowChatOnMobile(true);
                        }}
                        className={`p-4 cursor-pointer transition-colors duration-300 ${
                          selectedSession === session.id
                            ? isDarkMode
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 text-purple-900'
                            : isDarkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedSession === session.id
                                ? 'bg-purple-500 text-white'
                                : isDarkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <User className='w-5 h-5' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3
                              className={`font-medium transition-colors duration-500 ${
                                selectedSession === session.id
                                  ? 'text-white'
                                  : isDarkMode
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {session.psychologistName || 'Psicólogo'}
                            </h3>
                            <p
                              className={`text-sm transition-colors duration-500 ${
                                selectedSession === session.id
                                  ? 'text-purple-100'
                                  : isDarkMode
                                  ? 'text-gray-400'
                                  : 'text-gray-600'
                              }`}
                            >
                              {session.lastMessage || 'Sin mensajes'}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p
                              className={`text-xs transition-colors duration-500 ${
                                selectedSession === session.id
                                  ? 'text-purple-100'
                                  : isDarkMode
                                  ? 'text-gray-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {session.lastMessageAt ? formatTime(session.lastMessageAt) : ''}
                            </p>
                            {session.unreadCount > 0 && (
                              <span className='inline-flex items-center justify-center mt-1 bg-red-500 text-white text-xs rounded-full h-5 w-5'>
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

            {/* Chat Area - Responsive */}
            <div className={`flex-1 flex flex-col ${showChatOnMobile ? 'block' : 'hidden lg:flex'}`}>
              {selectedSession ? (
                <>
                  {/* Chat Header */}
                  <div
                    className={`p-4 border-b transition-colors duration-500 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          <User className='w-5 h-5' />
                        </div>
                        <div>
                          <h3
                            className={`font-medium transition-colors duration-500 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {(() => {
                              const currentSession = mySessions.find(s => s.id === selectedSession);
                              if (!currentSession) return 'Psicólogo';
                              
                              // Intentar obtener el nombre del psicólogo de múltiples fuentes
                              let psychologistName = currentSession.psychologistName;
                              
                              if (!psychologistName) {
                                const availablePsych = availablePsychs.find(p => p.userId === currentSession.psychologistId);
                                psychologistName = availablePsych?.displayName || availablePsych?.name;
                              }
                              
                              // Si aún no tenemos nombre, usar el ID como fallback
                              if (!psychologistName) {
                                psychologistName = currentSession.psychologistId || 'Psicólogo';
                              }
                              
                              return psychologistName;
                            })()}
                          </h3>
                          <p
                            className={`text-sm transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {(() => {
                              const currentSession = mySessions.find(s => s.id === selectedSession);
                              if (!currentSession) return 'Desconectado';
                              
                              const isOnline = psychologistOnlineStatus[currentSession.psychologistId];
                              return isOnline ? 'En línea' : 'Desconectado';
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Botón para cerrar chat en móvil */}
                      <button
                        onClick={() => setShowChatOnMobile(false)}
                        className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <X className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                    {messagesLoading ? (
                      <div className='text-center py-8'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
                        <p
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Cargando mensajes...
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className='text-center py-12'>
                        <MessageCircle
                          className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                        />
                        <h3
                          className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          No hay mensajes en esta conversación
                        </h3>
                        <p
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Envía un mensaje para comenzar
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="relative group">
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.uid
                                  ? isDarkMode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-500 text-white'
                                  : isDarkMode
                                  ? 'bg-gray-700 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className='text-sm'>{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderId === user?.uid
                                    ? 'text-purple-100'
                                    : isDarkMode
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                            
                            {/* Botón de eliminar para mensajes del usuario */}
                            {message.senderId === user?.uid && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                title="Eliminar mensaje"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div
                    className={`p-4 border-t transition-colors duration-500 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className='flex space-x-3'>
                      <input
                        type='text'
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='Escribe tu mensaje...'
                        className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                        }`}
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                          isSending || !newMessage.trim()
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : isDarkMode
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {isSending ? (
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        ) : (
                          <Send className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex-1 flex items-center justify-center'>
                  <div className='text-center'>
                    <MessageCircle
                      className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    />
                    <h3
                      className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Selecciona una conversación
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
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

export default UserChat;
