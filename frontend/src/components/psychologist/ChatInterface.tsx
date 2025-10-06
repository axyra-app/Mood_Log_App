import {
  CheckCircle,
  CheckCircle2,
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
import {
  getChatsByUser,
  getMessages,
  getUnreadMessageCountByChat,
  markAllMessagesAsRead,
  sendMessage,
  subscribeToChats,
  subscribeToMessages,
} from '../../services/chatService';
import { Chat, ChatMessage } from '../../types';

interface ChatInterfaceProps {
  psychologistId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ psychologistId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    setupRealtimeSubscriptions();
  }, [psychologistId]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await getChatsByUser(psychologistId);
      setChats(chatsData);

      // Load unread counts for each chat
      const counts: Record<string, number> = {};
      for (const chat of chatsData) {
        const count = await getUnreadMessageCountByChat(chat.id, psychologistId);
        counts[chat.id] = count;
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error cargando chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const unsubscribeChats = subscribeToChats(psychologistId, (updatedChats) => {
      setChats(updatedChats);
    });

    return () => {
      unsubscribeChats();
    };
  };

  const loadMessages = async () => {
    if (!selectedChat) return;

    try {
      const messagesData = await getMessages(selectedChat.id);
      setMessages(messagesData);

      // Setup real-time messages subscription
      const unsubscribeMessages = subscribeToMessages(selectedChat.id, (updatedMessages) => {
        setMessages(updatedMessages);
      });

      return unsubscribeMessages;
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat) return;

    try {
      await markAllMessagesAsRead(selectedChat.id, psychologistId);
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedChat.id]: 0,
      }));
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    try {
      await sendMessage({
        chatId: selectedChat.id,
        senderId: psychologistId,
        receiverId: selectedChat.participants.find((p) => p !== psychologistId) || '',
        content: newMessage.trim(),
        messageType: 'text',
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredChats = chats.filter((chat) =>
    chat.participants.some((participant) => participant.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    return messageDate.toLocaleDateString('es-ES');
  };

  const getMessageStatus = (message: ChatMessage) => {
    if (message.senderId === psychologistId) {
      return message.isRead ? (
        <CheckCircle2 className='h-4 w-4 text-blue-500' />
      ) : (
        <CheckCircle className='h-4 w-4 text-gray-400' />
      );
    }
    return null;
  };

  return (
    <div className='h-[600px] flex bg-white rounded-lg shadow'>
      {/* Chat List */}
      <div className='w-1/3 border-r border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>Conversaciones</h3>
          <div className='mt-2 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <input
              type='text'
              placeholder='Buscar conversaciones...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500'
            />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='p-4 text-center'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto'></div>
              <p className='mt-2 text-sm text-gray-600'>Cargando chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className='p-4 text-center text-gray-500'>No hay conversaciones</div>
          ) : (
            <div className='space-y-1'>
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='flex-shrink-0'>
                      <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-700'>
                          {chat.participants
                            .find((p) => p !== psychologistId)
                            ?.charAt(0)
                            .toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          Paciente {chat.participants.find((p) => p !== psychologistId)?.slice(0, 8) || 'Desconocido'}
                        </p>
                        {unreadCounts[chat.id] > 0 && (
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                            {unreadCounts[chat.id]}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center justify-between mt-1'>
                        <p className='text-sm text-gray-500 truncate'>{chat.lastMessage?.content || 'Sin mensajes'}</p>
                        <p className='text-xs text-gray-400'>
                          {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className='flex-1 flex flex-col'>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                  <span className='text-sm font-medium text-gray-700'>
                    {selectedChat.participants
                      .find((p) => p !== psychologistId)
                      ?.charAt(0)
                      .toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Paciente {selectedChat.participants.find((p) => p !== psychologistId)?.slice(0, 8) || 'Desconocido'}
                  </h4>
                  <p className='text-xs text-gray-500'>En línea</p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button className='p-2 text-gray-400 hover:text-gray-600'>
                  <Phone className='h-4 w-4' />
                </button>
                <button className='p-2 text-gray-400 hover:text-gray-600'>
                  <Video className='h-4 w-4' />
                </button>
                <button className='p-2 text-gray-400 hover:text-gray-600'>
                  <MoreVertical className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {messages.length === 0 ? (
                <div className='text-center text-gray-500'>No hay mensajes en esta conversación</div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderId === psychologistId;
                  const showDate =
                    index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className='text-center text-xs text-gray-500 my-4'>{formatDate(message.timestamp)}</div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className='text-sm'>{message.content}</p>
                          <div
                            className={`flex items-center justify-end mt-1 space-x-1 ${
                              isOwn ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            <span className='text-xs'>{formatTime(message.timestamp)}</span>
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='p-4 border-t border-gray-200'>
              <form onSubmit={handleSendMessage} className='flex items-center space-x-2'>
                <button type='button' className='p-2 text-gray-400 hover:text-gray-600'>
                  <Paperclip className='h-5 w-5' />
                </button>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='Escribe un mensaje...'
                    className='w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500'
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    <Smile className='h-5 w-5' />
                  </button>
                </div>
                <button
                  type='submit'
                  disabled={!newMessage.trim()}
                  className='p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Send className='h-5 w-5' />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Selecciona una conversación</h3>
              <p className='text-gray-500'>Elige una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
