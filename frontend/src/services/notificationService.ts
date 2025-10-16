import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  type: 'appointment_request' | 'appointment_accepted' | 'appointment_cancelled' | 'message' | 'system';
  title: string;
  message: string;
  userId?: string;
  psychologistId?: string;
  appointmentId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId?: string; // Si es 'all', significa que se notifica a todos
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Crear notificación para psicólogos cuando se solicita una cita
export const createAppointmentRequestNotification = async (appointmentData: {
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId?: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
}) => {
  try {
    console.log('🔔 Creando notificación de solicitud de cita:', appointmentData);

    // Si psychologistId es 'all', crear notificación para todos los psicólogos
    if (appointmentData.psychologistId === 'all') {
      // Obtener todos los psicólogos
      const psychologistsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'psychologist')
      );
      
      const psychologistsSnapshot = await getDocs(psychologistsQuery);
      
      // Crear notificación para cada psicólogo
      const notificationPromises = psychologistsSnapshot.docs.map(async (doc) => {
        const notificationData = {
          type: 'appointment_request',
          title: 'Nueva Solicitud de Cita',
          message: `${appointmentData.userName} solicita una cita para ${appointmentData.appointmentDate.toLocaleDateString('es-ES')} a las ${appointmentData.appointmentTime}`,
          // NO incluir userId aquí - solo para psicólogos
          psychologistId: doc.id,
          appointmentId: '', // Se actualizará después de crear la cita
          isRead: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        return addDoc(collection(db, 'notifications'), notificationData);
      });

      await Promise.all(notificationPromises);
      console.log('✅ Notificaciones creadas para todos los psicólogos');
    } else if (appointmentData.psychologistId) {
      // Crear notificación para un psicólogo específico
      const notificationData = {
        type: 'appointment_request',
        title: 'Nueva Solicitud de Cita',
        message: `${appointmentData.userName} solicita una cita para ${appointmentData.appointmentDate.toLocaleDateString('es-ES')} a las ${appointmentData.appointmentTime}`,
        // NO incluir userId aquí - solo para psicólogos
        psychologistId: appointmentData.psychologistId,
        appointmentId: '', // Se actualizará después de crear la cita
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ Notificación creada para psicólogo específico');
    }

    return true;
  } catch (error) {
    console.error('❌ Error creando notificación de solicitud de cita:', error);
    throw error;
  }
};

// Obtener notificaciones para un psicólogo
export const getPsychologistNotifications = (psychologistId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('psychologistId', '==', psychologistId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        psychologistId: data.psychologistId,
        appointmentId: data.appointmentId,
        isRead: data.isRead,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      });
    });
    callback(notifications);
  });
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Notificación marcada como leída');
  } catch (error) {
    console.error('❌ Error marcando notificación como leída:', error);
    throw error;
  }
};

// Crear notificación para usuario cuando se acepta/rechaza una cita
export const createAppointmentResponseNotification = async (
  userId: string,
  appointmentId: string,
  status: 'accepted' | 'rejected',
  psychologistName: string
) => {
  try {
    const notificationData = {
      type: 'appointment_accepted',
      title: status === 'accepted' ? 'Cita Aceptada' : 'Cita Rechazada',
      message: status === 'accepted' 
        ? `Tu cita con ${psychologistName} ha sido aceptada`
        : `Tu cita con ${psychologistName} ha sido rechazada`,
      userId: userId,
      appointmentId: appointmentId,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);
    console.log('✅ Notificación de respuesta de cita creada');
  } catch (error) {
    console.error('❌ Error creando notificación de respuesta de cita:', error);
    throw error;
  }
};

// Obtener notificaciones para un usuario
export const getUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        psychologistId: data.psychologistId,
        appointmentId: data.appointmentId,
        isRead: data.isRead,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      });
    });
    callback(notifications);
  });
};