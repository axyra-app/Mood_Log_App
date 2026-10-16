import { ArrowLeft, Send, Bot, Clock, Shield, Star } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { empatheticCompanionAgent, reflectionGuideAgent } from '../services/specializedAgents';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface AssistantProfile {
  name: string;
  description: string;
  icon: string;
  color: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
    color: string;
  }>;
}

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistant, setAssistant] = useState<AssistantProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistantProfiles: Record<'mia' | 'reflection', AssistantProfile> = {
    mia: {
      name: 'MIA',
      description: 'Un espacio para hablar de tu ánimo y explorar cómo te sientes',
      icon: '💬',
      color: 'from-pink-500 to-rose-500',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: 'Disponible cuando quieras', color: 'text-green-600' },
        { icon: <Shield className="w-4 h-4" />, text: 'Enfoque respetuoso', color: 'text-blue-600' },
        { icon: <Star className="w-4 h-4" />, text: 'Apoyo para autorreflexión', color: 'text-yellow-600' },
      ]
    },
    reflection: {
      name: 'Guía reflexiva',
      description: 'Preguntas para explorar hábitos, patrones y perspectivas',
      icon: '✨',
      color: 'from-blue-500 to-indigo-600',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: 'A tu propio ritmo', color: 'text-green-600' },
        { icon: <Shield className="w-4 h-4" />, text: 'Preguntas abiertas', color: 'text-purple-600' },
        { icon: <Star className="w-4 h-4" />, text: 'Ideas prácticas', color: 'text-pink-600' },
      ]
    }
  };

  useEffect(() => {
    const assistantId = params.assistantId;
    if (assistantId !== 'mia' && assistantId !== 'reflection') {
      navigate('/chat');
      return;
    }

    setAssistant(assistantProfiles[assistantId]);

    setMessages([{
      id: 'welcome',
      content: assistantId === 'mia'
        ? 'Hola, soy MIA. Estoy aquí para escucharte sin juicios y ayudarte a explorar cómo te sientes. ¿Cómo va tu ánimo hoy?'
        : 'Hola, soy una guía reflexiva de IA. Puedo ayudarte a observar una situación desde distintas perspectivas. ¿Qué tienes en mente?',
      sender: 'ai',
      timestamp: new Date(),
    }]);
  }, [params.assistantId, navigate]);

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
      const agent = params.assistantId === 'mia'
        ? empatheticCompanionAgent
        : reflectionGuideAgent;
      const aiResponse = await agent.chat(inputMessage);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar mensaje. Por favor, inténtalo de nuevo.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Disculpa, estoy teniendo dificultades técnicas. Inténtalo de nuevo más tarde. Si existe peligro inmediato, contacta los servicios de emergencia de tu localidad.',
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

  if (!assistant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando conversación...</p>
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
              
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${assistant.color} flex items-center justify-center text-white text-xl`}>
                {assistant.icon}
              </div>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{assistant.name}</h1>
                <p className="text-sm text-gray-600">{assistant.description}</p>
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
                placeholder={`Escribe un mensaje para ${assistant.name}...`}
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
                  : `bg-gradient-to-r ${assistant.color} text-white hover:opacity-90`
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <p>💡 <strong>Recuerda:</strong> Esta conversación generada por IA es para autorreflexión; no proporciona atención clínica ni asesoría médica. Ante un peligro inmediato, contacta los servicios de emergencia de tu localidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
