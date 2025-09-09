import { Info, MoreVertical, Paperclip, Phone, Send, Smile, Video } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { markAllMessagesAsRead, sendMessage, subscribeToMessages } from '../services/chatService';
import { Chat, ChatMessage, User } from '../types';

interface ChatInterfaceProps {
  chat: Chat;
  currentUser: User;
  otherUser: User;
  isDarkMode?: boolean;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, currentUser, otherUser, isDarkMode = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(chat.id!, (newMessages) => {
      setMessages(newMessages);
    });

    // Mark messages as read
    markAllMessagesAsRead(chat.id!, currentUser.uid);

    return unsubscribe;
  }, [chat.id, currentUser.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        chatId: chat.id!,
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        content: newMessage.trim(),
        messageType: 'text',
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload file and send message with file URL
      const { uploadChatFile } = await import('../services/chatService');
      const fileUrl = await uploadChatFile(file, chat.id!);

      await sendMessage({
        chatId: chat.id!,
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        content: `Archivo: ${file.name}`,
        messageType: 'file',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🤔', '🎉'];

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold'>
            {otherUser.displayName?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='font-semibold'>{otherUser.displayName || otherUser.email}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {otherUser.role === 'psychologist' ? 'Psicólogo' : 'Paciente'}
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
            <Phone className='w-5 h-5' />
          </button>
          <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
            <Video className='w-5 h-5' />
          </button>
          <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
            <Info className='w-5 h-5' />
          </button>
          {onClose && (
            <button onClick={onClose} className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
              <MoreVertical className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUser.uid;
          const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

          return (
            <div key={message.id}>
              {showDate && (
                <div className='text-center text-sm text-gray-500 mb-4'>{formatDate(message.timestamp)}</div>
              )}

              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {!isOwn && (
                    <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold'>
                      {otherUser.displayName?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className='text-sm'>{message.content}</div>
                    <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className='flex justify-start'>
            <div className='flex space-x-2'>
              <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold'>
                {otherUser.displayName?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSendMessage} className='flex items-center space-x-2'>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <Paperclip className='w-5 h-5' />
          </button>

          <div className='relative flex-1'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Escribe un mensaje...'
              className={`w-full px-4 py-2 rounded-full border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />

            {showEmojiPicker && (
              <div
                className={`absolute bottom-full mb-2 left-0 p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                } shadow-lg`}
              >
                <div className='grid grid-cols-5 gap-1'>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type='button'
                      onClick={() => addEmoji(emoji)}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type='button'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <Smile className='w-5 h-5' />
          </button>

          <button
            type='submit'
            disabled={!newMessage.trim()}
            className='p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Send className='w-5 h-5' />
          </button>
        </form>

        <input
          ref={fileInputRef}
          type='file'
          onChange={handleFileUpload}
          className='hidden'
          accept='image/*,application/pdf,.doc,.docx'
        />
      </div>
    </div>
  );
};

export default ChatInterface;
