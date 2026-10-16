import { Heart, MessageCircle, Minimize2, Send, Sparkles, User, X } from 'lucide-react';
import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { empatheticCompanionAgent } from '../services/specializedAgents';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  message: 'Hola, soy MIA. Este es un espacio para hablar de cómo te sientes, sin juicios. ¿Cómo va tu ánimo hoy?',
  sender: 'ai',
  timestamp: new Date(),
};

const suggestedMessages = [
  'Quiero hablar de cómo me siento',
  'Hoy ha sido un día difícil',
  'Necesito calmar mi mente',
];

const FloatingChatBubble: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      message: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((previous) => [...previous, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await empatheticCompanionAgent.chat(userMessage);
      setMessages((previous) => [
        ...previous,
        {
          id: `mia_${Date.now()}`,
          message: response,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message to MIA:', error);
      setMessage(userMessage);
      toast.error(error instanceof Error ? error.message : 'MIA no pudo responder. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className='fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-6 z-40'>
      {!isOpen ? (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          aria-label='Abrir chat con MIA para hablar sobre tu estado de ánimo'
          className='group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white shadow-xl shadow-violet-900/20 ring-1 ring-white/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300'
        >
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15'>
            <Heart className='h-5 w-5' aria-hidden='true' />
          </span>
          <span className='pr-1 text-left'>
            <span className='block text-sm font-bold leading-4'>MIA</span>
            <span className='mt-0.5 block text-[11px] leading-4 text-white/85'>Hablemos de tu ánimo</span>
          </span>
          <MessageCircle className='ml-1 h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5' aria-hidden='true' />
        </button>
      ) : (
        <section
          aria-label='Chat con MIA'
          className={`flex w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border shadow-2xl shadow-gray-950/20 ${
            isMinimized ? 'h-auto' : 'h-[min(640px,calc(100dvh-6rem))]'
          } ${
            isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          <header className='relative flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-4 text-white'>
            <div className='absolute inset-x-0 top-0 h-px bg-white/30' />
            <div className='flex min-w-0 items-center gap-3'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25'>
                <Heart className='h-5 w-5' aria-hidden='true' />
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-base font-bold tracking-wide'>MIA</h2>
                  <span className='rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/90'>
                    IA
                  </span>
                </div>
                <p className='mt-0.5 truncate text-xs text-white/85'>Un espacio para tu bienestar emocional</p>
              </div>
            </div>
            <div className='ml-2 flex shrink-0 items-center gap-1'>
              <button
                type='button'
                onClick={() => setIsMinimized((minimized) => !minimized)}
                aria-label={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
                className='rounded-xl p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                <Minimize2 className='h-4 w-4' aria-hidden='true' />
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                aria-label='Cerrar chat'
                className='rounded-xl p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              >
                <X className='h-4 w-4' aria-hidden='true' />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div
                className={`flex items-start gap-2 border-b px-4 py-2.5 text-[11px] leading-relaxed ${
                  isDarkMode
                    ? 'border-gray-800 bg-gray-950/60 text-gray-400'
                    : 'border-violet-100 bg-violet-50/70 text-gray-600'
                }`}
              >
                <Sparkles className='mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500' aria-hidden='true' />
                <p>MIA es una IA para autorreflexión, no atención clínica. Tus mensajes se envían a Groq y no se guardan aquí.</p>
              </div>

              <div
                aria-live='polite'
                className={`flex-1 space-y-4 overflow-y-auto px-4 py-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50/70'}`}
              >
                {messages.map((chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`flex items-end gap-2 ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {chatMessage.sender === 'ai' && (
                      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm'>
                        <Heart className='h-3.5 w-3.5' aria-hidden='true' />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                        chatMessage.sender === 'user'
                          ? 'rounded-br-md bg-violet-600 text-white'
                          : isDarkMode
                            ? 'rounded-bl-md border border-gray-700 bg-gray-800 text-gray-100'
                            : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>{chatMessage.message}</p>
                      <time
                        className={`mt-1.5 block text-right text-[10px] ${
                          chatMessage.sender === 'user' ? 'text-violet-100/80' : 'text-gray-400'
                        }`}
                      >
                        {chatMessage.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    {chatMessage.sender === 'user' && (
                      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200'>
                        <User className='h-3.5 w-3.5' aria-hidden='true' />
                      </div>
                    )}
                  </div>
                ))}

                {messages.length === 1 && !isLoading && (
                  <div className='flex flex-wrap gap-2 pl-9'>
                    {suggestedMessages.map((suggestion) => (
                      <button
                        key={suggestion}
                        type='button'
                        onClick={() => setMessage(suggestion)}
                        className={`rounded-full border px-3 py-2 text-left text-xs transition hover:border-violet-300 hover:text-violet-700 ${
                          isDarkMode
                            ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-violet-300'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-violet-50'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className='flex items-end gap-2' aria-label='MIA está escribiendo'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'>
                      <Heart className='h-3.5 w-3.5' aria-hidden='true' />
                    </div>
                    <div className={`flex gap-1 rounded-2xl rounded-bl-md px-4 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400' />
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]' />
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]' />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(event) => void handleSendMessage(event)}
                className={`border-t px-3 pb-3 pt-3 ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}
              >
                <div className={`flex items-end gap-2 rounded-2xl border p-1.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800 focus-within:ring-violet-900/40' : 'border-gray-200 bg-gray-50'
                }`}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Cuéntale a MIA cómo te sientes...'
                    aria-label='Mensaje para MIA'
                    maxLength={4000}
                    className={`max-h-24 min-h-10 flex-1 resize-y bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-gray-400 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  />
                  <button
                    type='submit'
                    disabled={!message.trim() || isLoading}
                    aria-label='Enviar mensaje a MIA'
                    className='mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500'
                  >
                    <Send className='h-4 w-4' aria-hidden='true' />
                  </button>
                </div>
                <p className={`mt-2 text-center text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  MIA acompaña tu reflexión; no reemplaza ayuda profesional ni servicios de emergencia.
                </p>
              </form>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default FloatingChatBubble;
