import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Chat, ChatMessage } from '../types';
import { db } from './firebase';

// Chat Management Functions
export const createChat = async (chatData: Omit<Chat, 'id' | 'createdAt' | 'lastMessageAt'>): Promise<string> => {
  try {
    const chatsRef = collection(db, 'chats');
    const docRef = await addDoc(chatsRef, {
      ...chatData,
      isActive: true,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      return { id: chatSnap.id, ...chatSnap.data() } as Chat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    throw error;
  }
};

export const getChatsByUser = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('lastMessageAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
  } catch (error) {
    console.error('Error getting chats by user:', error);
    throw error;
  }
};

export const getChatBetweenUsers = async (userId1: string, userId2: string): Promise<Chat | null> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId1), where('isActive', '==', true));

    const querySnapshot = await getDocs(q);
    const chat = querySnapshot.docs.find((doc) => {
      const data = doc.data() as Chat;
      return data.participants.includes(userId2);
    });

    if (chat) {
      return { id: chat.id, ...chat.data() } as Chat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat between users:', error);
    throw error;
  }
};

export const closeChat = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error closing chat:', error);
    throw error;
  }
};

// Message Functions
export const sendMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): Promise<string> => {
  try {
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp(),
      isRead: false,
    });

    // Update chat's last message
    const chatRef = doc(db, 'chats', messageData.chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        id: docRef.id,
        content: messageData.content,
        timestamp: serverTimestamp(),
        senderId: messageData.senderId,
      },
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId: string, limitCount: number = 50): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chatId', '==', chatId), orderBy('timestamp', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const markAllMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Real-time subscriptions
export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, where('chatId', '==', chatId), orderBy('timestamp', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(messages);
  });
};

export const subscribeToChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    where('isActive', '==', true),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
    callback(chats);
  });
};

// Unread message counts
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('receiverId', '==', userId), where('isRead', '==', false));

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
};

export const getUnreadMessageCountByChat = async (chatId: string, userId: string): Promise<number> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread message count by chat:', error);
    throw error;
  }
};

// Chat search functionality
export const searchMessages = async (chatId: string, searchTerm: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chatId', '==', chatId), orderBy('timestamp', 'desc'));

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];

    // Filter messages by search term (client-side filtering)
    return messages.filter((message) => message.content.toLowerCase().includes(searchTerm.toLowerCase()));
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

// Typing indicators
export const setTypingStatus = async (chatId: string, userId: string, isTyping: boolean): Promise<void> => {
  try {
    const typingRef = doc(db, 'typing', `${chatId}_${userId}`);
    if (isTyping) {
      await updateDoc(typingRef, {
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    } else {
      await deleteDoc(typingRef);
    }
  } catch (error) {
    console.error('Error setting typing status:', error);
    throw error;
  }
};

export const subscribeToTypingStatus = (chatId: string, callback: (typingUsers: string[]) => void) => {
  const typingRef = collection(db, 'typing');
  const q = query(typingRef, where('chatId', '==', chatId));

  return onSnapshot(q, (querySnapshot) => {
    const typingUsers = querySnapshot.docs.map((doc) => doc.id.split('_')[1]);
    callback(typingUsers);
  });
};

// File sharing in chat
export const uploadChatFile = async (file: File, chatId: string): Promise<string> => {
  try {
    const { uploadFile } = await import('./firebase');
    const fileName = `chat/${chatId}/${Date.now()}_${file.name}`;
    const downloadURL = await uploadFile(file, fileName);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading chat file:', error);
    throw error;
  }
};

// Chat notifications
export const sendChatNotification = async (chatId: string, message: string, recipientId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId: recipientId,
      type: 'message',
      title: 'Nuevo mensaje',
      body: message,
      data: { chatId },
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending chat notification:', error);
    throw error;
  }
};
