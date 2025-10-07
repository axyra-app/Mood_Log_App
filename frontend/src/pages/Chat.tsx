import {
  ArrowLeft,
  Circle,
  CircleDot,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats } from '../services/firestore';
import { subscribeToMessages } from '../services/chatService';
import { usePsychologists } from '../hooks/usePsychologists';
import { Chat as ChatType, ChatMessage, Psychologist } from '../types';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { psychologistId } = useParams<{ psychologistId: string }>();
  const { psychologists, loading: psychologistsLoading } = usePsychologists();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && psychologists.length > 0) {
      loadData();
    }
  }, [user, psychologists]);

  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToMessages(selectedChat.id, (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Los psicólogos ya se cargan desde usePsychologists hook
      console.log('📋 Chat - Psicólogos cargados:', psychologists.length);
      console.log('📋 Chat - Psicólogos disponibles:', psychologists.map(p => ({ id: p.id, name: p.name })));

      // Cargar chats del usuario
      const userChats = await getUserChats(user.uid).catch(() => []);
      console.log('📋 Chat - Chats del usuario:', userChats.length);
      setChats(userChats);

      // Seleccionar el primer chat si existe
      if (userChats.length > 0) {
        setSelectedChat(userChats[0]);
        console.log('📋 Chat - Chat seleccionado:', userChats[0].id);
      }
    } catch (error) {
      console.error('❌ Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      // Simular envío de mensaje para desarrollo
      const newMessageObj: ChatMessage = {
        id: `msg_${Date.now()}`,
        chatId: selectedChat.id,
        senderId: user.uid,
        receiverId: selectedChat.participants.find((p) => p !== user.uid) || '',
        content: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
      };

      // Agregar mensaje localmente
      setMessages((prev) => [...prev, newMessageObj]);
      setNewMessage('');
      scrollToBottom();

      // Simular respuesta automática del psicólogo después de 2 segundos
      setTimeout(() => {
        const psychologistResponse: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          chatId: selectedChat.id,
          senderId: selectedChat.participants.find((p) => p !== user.uid) || '',
          receiverId: user.uid,
          content: 'Gracias por tu mensaje. Estoy aquí para ayudarte. ¿Cómo te sientes hoy?',
          timestamp: new Date(),
          isRead: false,
          messageType: 'text',
        };
        setMessages((prev) => [...prev, psychologistResponse]);
        scrollToBottom();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = async (psychologist: Psychologist) => {
    if (!user) return;

    console.log('🚀 Iniciando nuevo chat con psicólogo:', psychologist.name, psychologist.id);

    try {
      // Verificar si ya existe un chat con este psicólogo
      const existingChat = chats.find(
        (chat) => chat.participants.includes(psychologist.id) && chat.participants.includes(user.uid)
      );

      if (existingChat) {
        console.log('📋 Chat existente encontrado:', existingChat.id);
        setSelectedChat(existingChat);
        return;
      }

      // Crear nuevo chat simulado
      const chatId = `chat_${Date.now()}`;
      console.log('📋 Chat ID generado:', chatId);
      
      const newChat: ChatType = {
        id: chatId,
        participants: [user.uid, psychologist.id],
        lastMessageAt: new Date(),
        isActive: true,
        createdAt: new Date(),
      };

      console.log('📋 Nuevo chat creado:', newChat);
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
      setMessages([]); // Limpiar mensajes anteriores

      // Agregar mensaje de bienvenida
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        chatId: chatId,
        senderId: psychologist.id,
        receiverId: user.uid,
        content: `¡Hola! Soy ${psychologist.name}. Estoy aquí para ayudarte con tu bienestar emocional. ¿En qué puedo asistirte hoy?`,
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
      };

      console.log('📋 Mensaje de bienvenida:', welcomeMessage);
      setMessages([welcomeMessage]);
      console.log('✅ Chat iniciado exitosamente');
    } catch (error) {
      console.error('❌ Error starting new chat:', error);
    }
  };

  const filteredPsychologists = psychologists.filter(
    (psych) =>
      psych.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psych.specialization?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || psychologistsLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16'>
              <div className='flex items-center space-x-4'>
                <Link
                  to='/dashboard'
                  className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <ArrowLeft className='w-5 h-5 mr-2' />
                  Volver al Dashboard
                </Link>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>Chat con Psicólogos</h1>
                  <p className='text-sm text-gray-500'>Conecta con profesionales de salud mental</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]'>
            {/* Sidebar - Lista de chats y psicólogos */}
            <div className='lg:col-span-1 space-y-6'>
              {/* Psicólogos disponibles */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>Psicólogos</h3>
                  <div className='relative'>
                    <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Buscar...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>
                </div>

                <div className='space-y-3 max-h-64 overflow-y-auto'>
                  {filteredPsychologists.map((psychologist) => (
                    <div
                      key={psychologist.id}
                      className='p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                      onClick={() => startNewChat(psychologist)}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center'>
                          <span className='text-white font-semibold text-sm'>
                            {psychologist.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center space-x-2'>
                            <p className='font-medium text-gray-900 truncate'>
                              {psychologist.name || 'Psicólogo'}
                            </p>
                            {psychologist.isAvailable ? (
                              <CircleDot className='w-3 h-3 text-green-500' />
                            ) : (
                              <Circle className='w-3 h-3 text-gray-400' />
                            )}
                          </div>
                          <p className='text-sm text-gray-600 truncate'>{psychologist.specialization}</p>
                          <div className='flex items-center space-x-1'>
                            <span className='text-yellow-500'>⭐</span>
                            <span className='text-sm text-gray-600'>{psychologist.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chats recientes */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Conversaciones</h3>
                <div className='space-y-3'>
                  {chats.map((chat) => {
                    const otherParticipant = psychologists.find(
                      (p) => chat.participants.includes(p.id) && p.id !== user?.uid
                    );

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat?.id === chat.id
                            ? 'bg-purple-50 border border-purple-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center'>
                            <span className='text-white font-semibold text-sm'>
                              {otherParticipant?.displayName?.charAt(0) || 'P'}
                            </span>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>
                              {otherParticipant?.displayName || 'Psicólogo'}
                            </p>
                            <p className='text-sm text-gray-600 truncate'>
                              {chat.lastMessage?.content || 'Sin mensajes'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Área de chat */}
            <div className='lg:col-span-3'>
              {selectedChat ? (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col'>
                  {/* Header del chat */}
                  <div className='p-6 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center'>
                          <span className='text-white font-semibold'>
                            {psychologists
                              .find((p) => selectedChat.participants.includes(p.id) && p.id !== user?.uid)
                              ?.displayName?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {psychologists.find((p) => selectedChat.participants.includes(p.id) && p.id !== user?.uid)
                              ?.displayName || 'Psicólogo'}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {
                              psychologists.find((p) => selectedChat.participants.includes(p.id) && p.id !== user?.uid)
                                ?.specialization
                            }
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                          <Phone className='w-5 h-5' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                          <Video className='w-5 h-5' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                          <MoreVertical className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className='flex-1 p-6 overflow-y-auto'>
                    <div className='space-y-4'>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.senderId === user?.uid ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className='text-sm'>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user?.uid ? 'text-purple-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp && typeof message.timestamp.toDate === 'function' 
                                ? message.timestamp.toDate().toLocaleTimeString()
                                : new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input de mensaje */}
                  <div className='p-6 border-t border-gray-200'>
                    <div className='flex items-center space-x-4'>
                      <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                        <Paperclip className='w-5 h-5' />
                      </button>
                      <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                        <Smile className='w-5 h-5' />
                      </button>

                      <div className='flex-1'>
                        <input
                          type='text'
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder='Escribe un mensaje...'
                          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        />
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <Send className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex items-center justify-center'>
                  <div className='text-center'>
                    <MessageCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>Selecciona un psicólogo</h3>
                    <p className='text-gray-600'>Elige un profesional para comenzar una conversación</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
