import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Appointment {
  id: string;
  userId: string;
  psychologistId?: string;
  psychologistName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  appointmentDate: Date;
  duration: number; // en minutos
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  completedAt?: Date;
}

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  psychologistId: string;
  userId: string;
  userName: string;
  type: 'new_appointment' | 'appointment_accepted' | 'appointment_rejected' | 'appointment_cancelled';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Crear nueva cita
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Crear notificación para todos los psicólogos
    await notifyPsychologistsNewAppointment(docRef.id, appointmentData);

    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Notificar a todos los psicólogos sobre nueva cita
const notifyPsychologistsNewAppointment = async (appointmentId: string, appointmentData: any) => {
  try {
    // Obtener todos los psicólogos disponibles
    const psychologistsRef = collection(db, 'psychologists');
    const q = query(psychologistsRef, where('isAvailable', '==', true));
    const querySnapshot = await getDocs(q);

    // Obtener datos del usuario
    const userRef = doc(db, 'users', appointmentData.userId);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists() ? userSnap.data().displayName || 'Usuario' : 'Usuario';

    // Crear notificación para cada psicólogo
    const notificationsRef = collection(db, 'notifications');
    const notifications = querySnapshot.docs.map(psychologistDoc => ({
      appointmentId,
      psychologistId: psychologistDoc.id,
      userId: appointmentData.userId,
      userName,
      type: 'new_appointment',
      message: `Nueva cita solicitada por ${userName} para ${appointmentData.appointmentDate.toLocaleDateString()}`,
      isRead: false,
      createdAt: serverTimestamp(),
    }));

    // Crear todas las notificaciones
    for (const notification of notifications) {
      await addDoc(notificationsRef, notification);
    }
  } catch (error) {
    console.error('Error notifying psychologists:', error);
  }
};

// Aceptar cita
export const acceptAppointment = async (appointmentId: string, psychologistId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointmentSnap.data();
    
    // Actualizar la cita
    await updateDoc(appointmentRef, {
      psychologistId,
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Obtener datos del psicólogo
    const psychologistRef = doc(db, 'psychologists', psychologistId);
    const psychologistSnap = await getDoc(psychologistRef);
    const psychologistName = psychologistSnap.exists() ? psychologistSnap.data().name || 'Psicólogo' : 'Psicólogo';

    // Crear notificación para el usuario
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      appointmentId,
      userId: appointmentData.userId,
      psychologistId,
      type: 'appointment_accepted',
      message: `Tu cita ha sido aceptada por ${psychologistName}`,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    // Eliminar notificaciones de otros psicólogos
    await removeOtherPsychologistNotifications(appointmentId, psychologistId);

  } catch (error) {
    console.error('Error accepting appointment:', error);
    throw error;
  }
};

// Rechazar cita
export const rejectAppointment = async (appointmentId: string, psychologistId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointmentSnap.data();
    
    // Actualizar la cita
    await updateDoc(appointmentRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Eliminar notificación de este psicólogo
    await removePsychologistNotification(appointmentId, psychologistId);

  } catch (error) {
    console.error('Error rejecting appointment:', error);
    throw error;
  }
};

// Eliminar notificaciones de otros psicólogos cuando se acepta una cita
const removeOtherPsychologistNotifications = async (appointmentId: string, acceptedPsychologistId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('appointmentId', '==', appointmentId),
      where('type', '==', 'new_appointment'),
      where('psychologistId', '!=', acceptedPsychologistId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'notifications', docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing other psychologist notifications:', error);
  }
};

// Eliminar notificación de un psicólogo específico
const removePsychologistNotification = async (appointmentId: string, psychologistId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('appointmentId', '==', appointmentId),
      where('psychologistId', '==', psychologistId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'notifications', docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing psychologist notification:', error);
  }
};

// Obtener citas de un usuario
export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    console.log('🔍 Obteniendo citas para userId:', userId);
    const appointmentsRef = collection(db, 'appointments');
    
    // Usar filtro por userId para evitar problemas de permisos
    const q = query(appointmentsRef, where('userId', '==', userId));
    console.log('🔍 Ejecutando consulta de citas...');
    const querySnapshot = await getDocs(q);
    console.log('✅ Consulta exitosa, documentos encontrados:', querySnapshot.docs.length);
    
    const appointments: Appointment[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const appointmentData = docSnapshot.data();
      
      const appointment: Appointment = {
        id: docSnapshot.id,
        userId: appointmentData.userId,
        psychologistId: appointmentData.psychologistId,
        psychologistName: appointmentData.psychologistName,
        status: appointmentData.status,
        appointmentDate: appointmentData.appointmentDate?.toDate() || new Date(),
        duration: appointmentData.duration || 60,
        type: appointmentData.type || 'consultation',
        reason: appointmentData.reason || '',
        notes: appointmentData.notes,
        createdAt: appointmentData.createdAt?.toDate() || new Date(),
        updatedAt: appointmentData.updatedAt?.toDate() || new Date(),
        acceptedAt: appointmentData.acceptedAt?.toDate(),
        rejectedAt: appointmentData.rejectedAt?.toDate(),
        completedAt: appointmentData.completedAt?.toDate(),
      };
      
      appointments.push(appointment);
    }

    // Ordenar por fecha de cita (descendente)
    appointments.sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime());

    return appointments;
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

// Obtener notificaciones de un psicólogo
export const getPsychologistNotifications = async (psychologistId: string): Promise<AppointmentNotification[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('psychologistId', '==', psychologistId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notifications: AppointmentNotification[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const notificationData = docSnapshot.data();
      
      const notification: AppointmentNotification = {
        id: docSnapshot.id,
        appointmentId: notificationData.appointmentId,
        psychologistId: notificationData.psychologistId,
        userId: notificationData.userId,
        userName: notificationData.userName,
        type: notificationData.type,
        message: notificationData.message,
        isRead: notificationData.isRead || false,
        createdAt: notificationData.createdAt?.toDate() || new Date(),
      };
      
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error getting psychologist notifications:', error);
    throw error;
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Suscribirse a notificaciones de un psicólogo
export const subscribeToPsychologistNotifications = (
  psychologistId: string,
  callback: (notifications: AppointmentNotification[]) => void
) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('psychologistId', '==', psychologistId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications: AppointmentNotification[] = [];
    
    querySnapshot.docs.forEach(docSnapshot => {
      const notificationData = docSnapshot.data();
      
      const notification: AppointmentNotification = {
        id: docSnapshot.id,
        appointmentId: notificationData.appointmentId,
        psychologistId: notificationData.psychologistId,
        userId: notificationData.userId,
        userName: notificationData.userName,
        type: notificationData.type,
        message: notificationData.message,
        isRead: notificationData.isRead || false,
        createdAt: notificationData.createdAt?.toDate() || new Date(),
      };
      
      notifications.push(notification);
    });
    
    callback(notifications);
  });
};
