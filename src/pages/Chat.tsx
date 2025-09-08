import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User, 
  Clock,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
  type: 'text' | 'system';
}

interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  online: boolean;
  lastSeen: any;
}

const Chat: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPsychologists();
  }, []);

  useEffect(() => {
    if (selectedPsychologist && user) {
      fetchMessages();
    }
  }, [selectedPsychologist, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPsychologists = async () => {
    try {
      // Simular psicólogos disponibles
      const mockPsychologists: Psychologist[] = [
        {
          id: 'psych1',
          name: 'Dr. María González',
          specialty: 'Ansiedad y Estrés',
          online: true,
          lastSeen: new Date()
        },
        {
          id: 'psych2',
          name: 'Dr. Carlos Rodríguez',
          specialty: 'Depresión y Estado de Ánimo',
          online: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
        },
        {
          id: 'psych3',
          name: 'Dra. Ana Martínez',
          specialty: 'Terapia Cognitivo-Conductual',
          online: true,
          lastSeen: new Date()
        }
      ];
      
      setPsychologists(mockPsychologists);
      
      // Seleccionar el primer psicólogo por defecto
      if (mockPsychologists.length > 0) {
        setSelectedPsychologist(mockPsychologists[0]);
      }
    } catch (error) {
      console.error('Error fetching psychologists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = () => {
    if (!selectedPsychologist || !user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', `${user.uid}_${selectedPsychologist.id}`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(messagesData);
      
      // Marcar mensajes como leídos
      markMessagesAsRead(messagesData);
    });

    return unsubscribe;
  };

  const markMessagesAsRead = async (messages: Message[]) => {
    if (!user || !selectedPsychologist) return;

    const unreadMessages = messages.filter(
      msg => msg.receiverId === user.uid && !msg.read
    );

    for (const message of unreadMessages) {
      const messageRef = doc(db, 'messages', message.id);
      await updateDoc(messageRef, { read: true });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedPsychologist || !user) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        senderId: user.uid,
        receiverId: selectedPsychologist.id,
        conversationId: `${user.uid}_${selectedPsychologist.id}`,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text' as const
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Chat con Psicólogos</h1>
                <p className="text-sm text-gray-600">Conecta con profesionales de la salud mental</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de psicólogos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Psicólogos Disponibles</h3>
              </div>
              <div className="p-2">
                {psychologists.map((psychologist) => (
                  <div
                    key={psychologist.id}
                    onClick={() => setSelectedPsychologist(psychologist)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPsychologist?.id === psychologist.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        {psychologist.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {psychologist.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {psychologist.specialty}
                        </p>
                        <p className="text-xs text-gray-400">
                          {psychologist.online ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              {selectedPsychologist ? (
                <>
                  {/* Header del chat */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          {selectedPsychologist.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedPsychologist.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedPsychologist.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Inicia una conversación
                        </h4>
                        <p className="text-gray-600">
                          Envía un mensaje a {selectedPsychologist.name} para comenzar
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.uid
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user?.uid
                                  ? 'text-primary-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de mensaje */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona un psicólogo
                    </h4>
                    <p className="text-gray-600">
                      Elige un profesional para comenzar a chatear
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

export default Chat;
