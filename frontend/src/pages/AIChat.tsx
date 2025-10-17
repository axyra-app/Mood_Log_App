import { ArrowLeft, Send, Bot, User, Clock, Shield, Star } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { drSofiaAgent, drCarlosAgent } from '../services/specializedAgents';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface DoctorProfile {
  name: string;
  specialty: string;
  icon: string;
  color: string;
  description: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
    color: string;
  }>;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Perfiles de los doctores
  const doctorProfiles: Record<string, DoctorProfile> = {
    'dr-sofia': {
      name: 'Dra. Sofia',
      specialty: 'Medicina General',
      icon: '🩺',
      color: 'from-blue-500 to-cyan-500',
      description: 'Respuestas inmediatas 24/7 con inteligencia artificial especializada',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: 'Disponible 24/7', color: 'text-green-600' },
        { icon: <Shield className="w-4 h-4" />, text: 'Respuestas inmediatas', color: 'text-blue-600' },
        { icon: <Star className="w-4 h-4" />, text: 'Basado en evidencia médica', color: 'text-yellow-600' }
      ]
    },
    'dr-carlos': {
      name: 'Dr. Carlos',
      specialty: 'Psicología Clínica',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500',
      description: 'Apoyo psicológico especializado con técnicas basadas en evidencia',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: 'Disponible 24/7', color: 'text-green-600' },
        { icon: <Shield className="w-4 h-4" />, text: 'Apoyo emocional', color: 'text-purple-600' },
        { icon: <Star className="w-4 h-4" />, text: 'Técnicas psicológicas', color: 'text-pink-600' }
      ]
    }
  };

  useEffect(() => {
    // Determinar qué doctor está seleccionado
    const doctorType = location.pathname.includes('dr-sofia') ? 'dr-sofia' : 'dr-carlos';
    setDoctor(doctorProfiles[doctorType]);

    // Mensaje de bienvenida inicial
    const welcomeMessage: Message = {
      id: 'welcome',
      content: doctorType === 'dr-sofia' 
        ? '¡Hola! Soy la Dra. Sofia, tu asistente médico virtual. Estoy aquí para ayudarte con consultas médicas generales, información sobre síntomas y consejos de salud. ¿En qué puedo ayudarte hoy?'
        : '¡Hola! Soy el Dr. Carlos, tu psicólogo virtual. Estoy aquí para brindarte apoyo emocional, técnicas de manejo del estrés y orientación psicológica. ¿Cómo te sientes hoy?',
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  }, [location.pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Determinar qué agente usar
      const doctorType = location.pathname.includes('dr-sofia') ? 'dr-sofia' : 'dr-carlos';
      const agent = doctorType === 'dr-sofia' ? drSofiaAgent : drCarlosAgent;

      // Obtener contexto del usuario si está disponible
      const context = user ? {
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      } : null;

      // Obtener respuesta del agente
      const aiResponse = await agent.chat(inputMessage, context);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error('Error al enviar mensaje. Por favor, inténtalo de nuevo.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Disculpa, estoy experimentando dificultades técnicas. Por favor, inténtalo de nuevo o consulta con un profesional en persona si es urgente.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando consulta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${doctor.color} flex items-center justify-center text-white text-xl`}>
                {doctor.icon}
              </div>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{doctor.name}</h1>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">En línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'ai' && (
                      <Bot className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-gray-500" />
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
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Escribe tu consulta para ${doctor.name}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${doctor.color} text-white hover:opacity-90`
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <p>💡 <strong>Recuerda:</strong> Esta es una consulta virtual. Para síntomas graves o emergencias, consulta con un profesional en persona.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
