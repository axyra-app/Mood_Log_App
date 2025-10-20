import { Bot, MessageCircle, Minimize2, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface FloatingChatBubbleProps {
  isDarkMode?: boolean;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estado local para mensajes
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      // Agregar mensaje del usuario
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        message: userMessage,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Simular respuesta de IA
      setTimeout(() => {
        const aiResponse = generateAIResponse(userMessage, user?.displayName || 'Usuario');
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string, userName: string): string => {
    const message = userMessage.toLowerCase();
    
    // Respuestas contextuales basadas en el mensaje del usuario
    if (message.includes('hola') || message.includes('hi')) {
      return `¡Hola ${userName}! 👋 Me alegra verte por aquí. Soy tu asistente de IA especializado en bienestar emocional. ¿Cómo te sientes hoy? ¿Hay algo en lo que pueda ayudarte?`;
    }
    
    if (message.includes('triste') || message.includes('deprimido') || message.includes('mal')) {
      return `Entiendo que te sientes así, ${userName}. 😔 Es completamente normal tener días difíciles. Te sugiero algunas estrategias que pueden ayudar:\n\n1. 🌱 Respiración profunda: Inhala por 4 segundos, mantén por 4, exhala por 6\n2. 🎵 Música relajante: Escucha tu música favorita\n3. 🚶‍♂️ Caminata corta: Aunque sea 10 minutos al aire libre\n4. 📝 Escribe tus pensamientos: El diario puede ser muy terapéutico\n\n¿Te gustaría que profundicemos en alguna de estas estrategias?`;
    }
    
    if (message.includes('ansioso') || message.includes('ansiedad') || message.includes('nervioso')) {
      return `La ansiedad puede ser abrumadora, ${userName}. 😌 Aquí tienes algunas técnicas que pueden ayudarte:\n\n1. 🧘‍♀️ Técnica 5-4-3-2-1: Identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas\n2. 💪 Tensión-relajación: Tensa y relaja cada grupo muscular\n3. 🌊 Respiración de caja: 4 segundos inhalar, 4 mantener, 4 exhalar, 4 pausa\n4. 🎯 Enfócate en el presente: ¿Qué puedes controlar ahora mismo?\n\n¿Cuál de estas técnicas te gustaría probar?`;
    }
    
    if (message.includes('feliz') || message.includes('bien') || message.includes('genial')) {
      return `¡Qué maravilloso, ${userName}! 😊 Me alegra saber que te sientes bien. Los momentos positivos son tan importantes como los desafiantes. Te sugiero:\n\n1. 🌟 Celebra este momento: Disfruta plenamente esta sensación\n2. 📝 Regístralo: Anota qué te hizo sentir así\n3. 🔄 Compártelo: Si tienes ganas, comparte tu alegría con alguien\n4. 🎯 Mantén el momentum: ¿Qué puedes hacer para prolongar este sentimiento?\n\n¿Qué te está haciendo sentir tan bien hoy?`;
    }
    
    if (message.includes('estrés') || message.includes('estresado') || message.includes('presión')) {
      return `El estrés puede ser muy desafiante, ${userName}. 😮‍💨 Aquí tienes algunas herramientas para manejarlo:\n\n1. 🧘‍♂️ Mindfulness: Dedica 5 minutos a observar tu respiración\n2. 📋 Prioriza: Haz una lista de 3 cosas más importantes hoy\n3. 🚫 Di no: Está bien establecer límites\n4. 🎨 Actividad creativa: Dibuja, escribe, o haz algo manual\n5. 💬 Habla con alguien: No tienes que enfrentarlo solo\n\n¿Qué tipo de estrés estás experimentando? ¿Laboral, personal, o académico?`;
    }
    
    if (message.includes('sueño') || message.includes('dormir') || message.includes('insomnio')) {
      return `El sueño es fundamental para tu bienestar, ${userName}. 😴 Aquí tienes algunas estrategias para mejorar tu descanso:\n\n1. 🌙 Rutina nocturna: Acuéstate y levántate a la misma hora\n2. 📱 Sin pantallas: Evita dispositivos 1 hora antes de dormir\n3. 🛁 Relajación: Un baño tibio o lectura ligera\n4. 🌡️ Ambiente fresco: Temperatura entre 18-21°C\n5. ☕ Sin cafeína: Evita cafeína después de las 2 PM\n\n¿Tienes problemas para conciliar el sueño o para mantenerlo?`;
    }
    
    if (message.includes('gracias') || message.includes('thank you')) {
      return `¡De nada, ${userName}! 😊 Es un placer poder ayudarte. Recuerda que estoy aquí siempre que necesites apoyo emocional o quieras conversar sobre tu bienestar.\n\n¿Hay algo más en lo que pueda asistirte hoy?`;
    }
    
    // Respuesta por defecto
    return `Gracias por compartir eso conmigo, ${userName}. 🤗 Cada experiencia es única y valiosa. Me gustaría entenderte mejor para poder ayudarte de la manera más efectiva.\n\n¿Podrías contarme más sobre cómo te sientes en este momento? ¿Hay algo específico que te gustaría trabajar o mejorar en tu bienestar emocional?`;
  };

  // No mostrar si no hay usuario autenticado
  if (!user) return null;

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          <MessageCircle className="w-6 h-6 text-white mx-auto" />
          {messages.filter(msg => msg.sender === 'ai').length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {messages.filter(msg => msg.sender === 'ai').length > 9 ? '9+' : messages.filter(msg => msg.sender === 'ai').length}
            </div>
          )}
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-80 h-96 rounded-xl shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-12' : ''
          } ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 rounded-t-xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dra. Sofia IA
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Asistente de Bienestar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={`p-1 rounded hover:bg-gray-600 transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded hover:bg-gray-600 transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ¡Hola {user.displayName || 'Usuario'}! 👋<br />
                      Soy tu asistente de bienestar emocional.<br />
                      ¿En qué puedo ayudarte hoy?
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.sender === 'user' 
                            ? 'bg-purple-500' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                          {msg.sender === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? isDarkMode 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-500 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-purple-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString('es-CO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Indicador de carga */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className={`px-3 py-2 rounded-lg ${
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

              {/* Input */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu consulta para Dra. Sofia..."
                    className={`flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      message.trim() && !isLoading
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : isDarkMode 
                          ? 'bg-gray-600 text-gray-400' 
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    💡 Recuerda: Esta es una consulta virtual. Para síntomas graves o emergencias, consulta con un profesional en persona.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatBubble;