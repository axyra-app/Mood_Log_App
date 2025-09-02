import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ArrowLeft, Heart, Info, MoreVertical, Phone, Plus, Search, Send, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewConversationModal from '../components/NewConversationModal';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isRead: boolean;
  conversationId: string;
}

interface Conversation {
  id: string;
  participants: { [userId: string]: boolean };
  participantNames: { [userId: string]: string };
  participantRoles: { [userId: string]: 'user' | 'psychologist' };
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: { [userId: string]: number };
  isOnline: { [userId: string]: boolean };
  avatar: { [userId: string]: string };
  createdAt: any;
}

const Chat = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchConversations = async () => {
      try {
        const q = query(
          collection(db, 'conversations'),
          where(`participants.${userProfile.uid}`, '==', true),
          orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const conversationsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Conversation[];

          setConversations(conversationsData);
          setLoading(false);

          // Select first conversation by default
          if (conversationsData.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationsData[0].id);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userProfile?.uid, selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !userProfile?.uid) return;

    const fetchMessages = async () => {
      try {
        const q = query(collection(db, 'conversations', selectedConversation, 'messages'), orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];

          setMessages(messagesData);

          // Mark messages as read
          const unreadMessages = messagesData.filter((msg) => msg.senderId !== userProfile.uid && !msg.isRead);

          if (unreadMessages.length > 0) {
            unreadMessages.forEach(async (msg) => {
              await updateDoc(doc(db, 'conversations', selectedConversation, 'messages', msg.id), {
                isRead: true,
              });
            });
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation, userProfile?.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userProfile?.uid) return;

    try {
      // Add message to Firestore
      await addDoc(collection(db, 'conversations', selectedConversation, 'messages'), {
        text: newMessage,
        senderId: userProfile.uid,
        senderName: userProfile.name,
        timestamp: serverTimestamp(),
        isRead: false,
        conversationId: selectedConversation,
      });

      // Update conversation with last message
      await updateDoc(doc(db, 'conversations', selectedConversation), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage('');
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

  const filteredConversations = conversations.filter((conv) => {
    if (!userProfile?.uid) return false;
    const otherParticipantId = Object.keys(conv.participants).find((id) => id !== userProfile.uid);
    if (!otherParticipantId) return false;
    const otherParticipantName = conv.participantNames[otherParticipantId] || '';
    return otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentConversation = conversations.find((conv) => conv.id === selectedConversation);

  const getOtherParticipant = (conversation: Conversation) => {
    if (!userProfile?.uid) return null;
    const otherParticipantId = Object.keys(conversation.participants).find((id) => id !== userProfile.uid);
    if (!otherParticipantId) return null;
    return {
      id: otherParticipantId,
      name: conversation.participantNames[otherParticipantId] || '',
      role: conversation.participantRoles[otherParticipantId] || 'user',
      isOnline: conversation.isOnline[otherParticipantId] || false,
      avatar: conversation.avatar[otherParticipantId] || '👤',
    };
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className='h-screen bg-white flex'>
      {/* Sidebar */}
      <div className='w-80 border-r border-gray-200 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <Heart className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-lg font-semibold text-gray-900'>Chat</h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className='p-2 text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar conversaciones...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='p-4 space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='animate-pulse flex items-center space-x-3'>
                  <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                  <div className='flex-1'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className='p-4 text-center text-gray-500'>
              <p>No hay conversaciones</p>
              <p className='text-sm'>Inicia una conversación con un psicólogo</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              if (!otherParticipant) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <div className='w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-xl'>
                        {otherParticipant.avatar}
                      </div>
                      {otherParticipant.isOnline && (
                        <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-gray-900 truncate'>{otherParticipant.name}</h3>
                        <span className='text-xs text-gray-500'>{formatTime(conversation.lastMessageTime)}</span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-gray-600 truncate'>{conversation.lastMessage}</p>
                        {userProfile?.uid && conversation.unreadCount[userProfile.uid] > 0 && (
                          <span className='bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                            {conversation.unreadCount[userProfile.uid]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* New Conversation Button */}
        <div className='p-4 border-t border-gray-200'>
          <button
            onClick={() => setShowNewConversationModal(true)}
            className='w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
          >
            <Plus className='w-5 h-5' />
            <span>Nueva Conversación</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex-1 flex flex-col'>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b border-gray-200 bg-white'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {(() => {
                    const otherParticipant = getOtherParticipant(currentConversation);
                    if (!otherParticipant) return null;

                    return (
                      <>
                        <div className='relative'>
                          <div className='w-10 h-10 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-xl'>
                            {otherParticipant.avatar}
                          </div>
                          {otherParticipant.isOnline && (
                            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                          )}
                        </div>
                        <div>
                          <h2 className='font-semibold text-gray-900'>{otherParticipant.name}</h2>
                          <p className='text-sm text-gray-500'>
                            {otherParticipant.isOnline ? 'En línea' : 'Desconectado'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className='flex items-center space-x-2'>
                  <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                    <Phone className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                    <Video className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                    <Info className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-gray-900 transition-colors'>
                    <MoreVertical className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {messages.length === 0 ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center text-gray-500'>
                    <p>No hay mensajes aún</p>
                    <p className='text-sm'>Envía el primer mensaje para comenzar la conversación</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === userProfile?.uid;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className='text-sm'>{message.text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='p-4 border-t border-gray-200 bg-white'>
              <div className='flex items-center space-x-3'>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Escribe un mensaje...'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className='p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  <Send className='w-5 h-5' />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>Selecciona una conversación</h3>
              <p className='text-gray-600'>Elige una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={(conversationId) => {
          setSelectedConversation(conversationId);
          setShowNewConversationModal(false);
        }}
      />
    </div>
  );
};

export default Chat;
