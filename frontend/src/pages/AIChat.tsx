import { ArrowLeft, Bot, Send, User, Clock, Shield, Star, Sun, Moon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AI_DOCTORS, generateAIResponse, detectUrgency, generateUrgentResponse } from '../services/aiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { doctorType } = useParams<{ doctorType: 'general' | 'specialist' }>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId] = useState(`ai-chat-${doctorType}-${user?.uid}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const doctor = AI_DOCTORS[doctorType || 'general'];

  useEffect(() => {
    // Mensaje de bienvenida inicial
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: `¡Hola! Soy ${doctor.name}, tu asistente médico virtual especializado en ${doctor.specialty}. Estoy aquí para ayudarte con cualquier consulta sobre tu salud mental y bienestar. ¿En qué puedo asistirte hoy?`,
      senderId: doctor.id,
      timestamp: new Date(),
      isRead: true,
      messageType: 'text'
    };
    setMessages([welcomeMessage]);
  }, [doctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.uid || '',
      timestamp: new Date(),
      isRead: true,
      messageType: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Detectar urgencia
      const urgency = detectUrgency(newMessage);
      
      let aiResponse;
      if (urgency === 'high' || urgency === 'medium') {
        aiResponse = generateUrgentResponse(urgency);
      } else {
        aiResponse = await generateAIResponse(newMessage, messages, doctorType);
      }

      // Simular delay de escritura
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        senderId: doctor.id,
        timestamp: new Date(),
        isRead: true,
        messageType: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Si hay sugerencias, agregarlas como mensajes especiales
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: `💡 Sugerencias: ${aiResponse.suggestions.join(', ')}`,
          senderId: doctor.id,
          timestamp: new Date(),
          isRead: true,
          messageType: 'text'
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, suggestionsMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Disculpa, estoy teniendo dificultades técnicas. Por favor, intenta de nuevo en un momento.',
        senderId: doctor.id,
        timestamp: new Date(),
        isRead: true,
        messageType: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-cyan-50'
    }`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chat')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {doctor.name}
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {doctor.specialty} • IA Asistente
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  En línea
                </span>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } h-[600px] flex flex-col`}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.senderId === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.senderId === user?.uid 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}>
                    {message.senderId === user?.uid ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.senderId === user?.uid
                      ? isDarkMode 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.uid 
                        ? 'text-purple-100' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje aquí..."
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  newMessage.trim() && !isTyping
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Info */}
        <div className={`mt-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ℹ️ Información sobre {doctor.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Disponible 24/7
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Basado en evidencia médica
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Star className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Respuestas inmediatas
              </span>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>⚠️ Importante:</strong> Este asistente IA no reemplaza la consulta médica profesional. 
              Para diagnósticos y tratamientos específicos, consulta siempre con un profesional de la salud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
