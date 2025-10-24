import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs, limit, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { usePatientRelations } from './usePatientRelations';
import { createAppointmentRequestNotification } from '../services/notificationService';
import { runAppointmentCleanup } from '../services/appointmentCleanupService';

export interface UserAppointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId: string;
  psychologistName: string;
  appointmentDate: Date;
  appointmentTime?: string;
  duration: number; // en minutos
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const useUserAppointments = (userId: string) => {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook para manejar relaciones paciente-psicólogo
  const { createPatientRelation } = usePatientRelations('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Ejecutar limpieza automática de citas al cargar (HABILITADA CON MEJORAS)
    runAppointmentCleanup(userId).catch(error => {
      console.error('Error ejecutando limpieza automática:', error);
    });

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('appointmentDate', 'asc')
    );

    const unsubscribe = onSnapshot(appointmentsQuery,
      async (snapshot) => {
        try {
          const appointmentsData: UserAppointment[] = [];
          
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            
            // Obtener información del psicólogo
            let psychologistName = 'Psicólogo';
            try {
              const psychologistDoc = await getDoc(doc(db, 'users', data.psychologistId));
              if (psychologistDoc.exists()) {
                psychologistName = psychologistDoc.data().displayName || 'Psicólogo';
              }
            } catch (psychologistError) {
              // Silenciar error, usar nombre por defecto
            }
            
            appointmentsData.push({
              id: docSnapshot.id,
              userId: data.userId,
              userName: data.userName || 'Usuario',
              userEmail: data.userEmail || '',
              psychologistId: data.psychologistId,
              psychologistName,
              appointmentDate: data.appointmentDate?.toDate ? data.appointmentDate.toDate() : (data.appointmentDate ? new Date(data.appointmentDate) : (data.date ? new Date(data.date) : new Date())),
              appointmentTime: data.appointmentTime || '',
              duration: data.duration || 60,
              type: data.type || 'consultation',
              reason: data.reason || '',
              notes: data.notes || '',
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
            });
          }
          
          setAppointments(appointmentsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching user appointments:', err);
          setError('Error al cargar las citas');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in user appointments listener:', err);
        setError('Error en la conexión de citas');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createAppointment = async (appointmentData: {
    psychologistId: string;
    appointmentDate: Date;
    appointmentTime?: string;
    duration: number;
    type: 'consultation' | 'follow-up' | 'emergency';
    reason: string;
    notes?: string;
    status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  }) => {
    try {
      // Validar parámetros requeridos
      if (!userId || !appointmentData.psychologistId || !appointmentData.appointmentDate) {
        throw new Error('Faltan parámetros requeridos para crear la cita');
      }
      
      // Obtener información del psicólogo
      let psychologistName = 'Psicólogo';
      try {
        const psychologistDoc = await getDoc(doc(db, 'users', appointmentData.psychologistId));
        if (psychologistDoc.exists()) {
          psychologistName = psychologistDoc.data().displayName || 'Psicólogo';
        }
      } catch (psychologistError) {
        // Silenciar error, usar nombre por defecto
      }

      // Obtener información del usuario
      let userName = 'Usuario';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userName = userDoc.data().displayName || userDoc.data().username || 'Usuario';
        }
      } catch (userError) {
        // Silenciar error, usar nombre por defecto
      }

      const firebaseAppointmentData = {
        userId: userId,
        userName,
        psychologistId: appointmentData.psychologistId,
        psychologistName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime || '',
        duration: appointmentData.duration,
        type: appointmentData.type,
        reason: appointmentData.reason,
        notes: appointmentData.notes || '',
        status: appointmentData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'appointments'), firebaseAppointmentData);
      
      // Crear notificaciones para psicólogos
      try {
        await createAppointmentRequestNotification({
          userId: userId,
          userName: userName,
          userEmail: userName + '@email.com', // Usar userName como base para email
          psychologistId: appointmentData.psychologistId,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime || '',
          duration: appointmentData.duration,
          type: appointmentData.type,
          reason: appointmentData.reason,
          notes: appointmentData.notes,
        });
      } catch (notificationError) {
        console.error('⚠️ Error creando notificaciones:', notificationError);
        // No lanzar error aquí para no interrumpir la creación de la cita
      }
      
      // Crear relación paciente-psicólogo para permitir acceso a moodLogs
      try {
        if (appointmentData.psychologistId !== 'all') {
          await createPatientRelation(userId, appointmentData.psychologistId);
        }
      } catch (relationError) {
        console.error('⚠️ Error creando relación paciente-psicólogo:', relationError);
        // No lanzar error aquí para no interrumpir la creación de la cita
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (appointmentId: string, updateData: Partial<UserAppointment>) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
  };
};
