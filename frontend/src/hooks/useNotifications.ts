import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  userId: string;
  psychologistId?: string;
  type: 'chat_message' | 'appointment_request' | 'appointment_accepted' | 'appointment_rejected' | 'medical_report' | 'profile_incomplete';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

export const useNotifications = (userId: string, userRole: 'user' | 'psychologist') => {
  const { user, profileLoaded } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !user || !profileLoaded) {
      setLoading(false);
      return;
    }

    console.log('🔔 useNotifications: Verificando perfil del usuario:', {
      userId,
      userRole,
      userDisplayName: user?.displayName,
      userUsername: user?.username,
      needsProfileCompletion: !user?.displayName || !user?.username,
      userLoaded: !!user,
      profileLoaded
    });

    // Query diferente según el rol del usuario
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where(userRole === 'user' ? 'userId' : 'psychologistId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        try {
          const notificationsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              psychologistId: data.psychologistId,
              type: data.type,
              title: data.title,
              message: data.message,
              isRead: data.isRead || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              data: data.data,
            };
          });

          // Verificar si el usuario necesita completar perfil
          // Solo crear notificación si el usuario está completamente cargado y le faltan datos
          // Verificar displayName y username (campos requeridos en CompleteProfile)
          const needsProfileCompletion = user && (!user.displayName || !user.username);
          
          console.log('🔔 useNotifications: Estado del perfil:', {
            displayName: user?.displayName,
            username: user?.username,
            needsProfileCompletion,
            willCreateProfileNotification: needsProfileCompletion,
            userExists: !!user
          });
          
          // Crear notificación de perfil incompleto si es necesario
          const profileNotification = needsProfileCompletion ? {
            id: 'profile-incomplete',
            userId: userId,
            type: 'profile_incomplete' as const,
            title: 'Perfil Incompleto',
            message: 'Necesitas completar tu perfil para acceder a todas las funcionalidades',
            isRead: false,
            createdAt: new Date(),
            data: null,
          } : null;

          // Combinar notificaciones
          const allNotifications = [
            ...(profileNotification ? [profileNotification] : []),
            ...notificationsData
          ];

          console.log('🔔 useNotifications: Notificaciones finales:', {
            totalNotifications: allNotifications.length,
            profileNotification: profileNotification ? 'SÍ' : 'NO',
            otherNotifications: notificationsData.length
          });

          setNotifications(allNotifications);
          setError(null);
        } catch (err) {
          console.error('Error processing notifications:', err);
          setError('Error al cargar las notificaciones');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in notifications listener:', err);
        setError('Error en la conexión de notificaciones');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userRole, user, profileLoaded]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      const updatePromises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: serverTimestamp(),
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
        isRead: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
};

// Función para crear notificación cuando un paciente escribe
export const createChatNotification = async (
  psychologistId: string,
  senderId: string,
  senderName: string,
  message: string,
  sessionId?: string
) => {
  try {
    console.log('🔔 Creando notificación de chat:', {
      psychologistId,
      senderId,
      senderName,
      messageLength: message.length,
      sessionId
    });

    const notificationData: any = {
      userId: psychologistId, // El psicólogo recibe la notificación
      psychologistId: psychologistId,
      senderId: senderId,
      senderName: senderName,
      type: 'chat_message',
      title: `Nuevo mensaje de ${senderName}`,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      isRead: false,
      createdAt: serverTimestamp(),
    };
    
    // Solo agregar relatedItemId si existe
    if (sessionId) {
      notificationData.relatedItemId = sessionId;
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log('✅ Notificación creada con ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating chat notification:', error);
    throw error;
  }
};

// Función para crear notificación cuando un psicólogo escribe
export const createPsychologistChatNotification = async (
  userId: string,
  senderId: string,
  senderName: string,
  message: string,
  sessionId?: string
) => {
  try {
    const notificationData: any = {
      userId: userId, // El usuario recibe la notificación
      psychologistId: senderId,
      senderId: senderId,
      senderName: senderName,
      type: 'chat_message',
      title: `Nuevo mensaje de ${senderName}`,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      isRead: false,
      createdAt: serverTimestamp(),
    };
    
    // Solo agregar relatedItemId si existe
    if (sessionId) {
      notificationData.relatedItemId = sessionId;
    }
    
    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating psychologist chat notification:', error);
  }
};
