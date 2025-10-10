import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs, limit, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { usePatientRelations } from './usePatientRelations';

export interface UserAppointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId: string;
  psychologistName: string;
  appointmentDate: Date;
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
              appointmentDate: data.appointmentDate?.toDate ? data.appointmentDate.toDate() : new Date(data.appointmentDate),
              duration: data.duration || 60,
              type: data.type || 'consultation',
              reason: data.reason || '',
              notes: data.notes || '',
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
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
    duration: number;
    type: 'consultation' | 'follow-up' | 'emergency';
    reason: string;
    notes?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  }) => {
    try {
      // Log temporal para debugging
      console.log('🔍 useUserAppointments - createAppointment called with:', {
        userId,
        appointmentData,
        hasUserId: !!userId,
        hasPsychologistId: !!appointmentData.psychologistId,
        hasAppointmentDate: !!appointmentData.appointmentDate
      });
      
      // Validar parámetros requeridos
      if (!userId || !appointmentData.psychologistId || !appointmentData.appointmentDate) {
        console.log('❌ Validation failed:', {
          userId: userId || 'MISSING',
          psychologistId: appointmentData.psychologistId || 'MISSING',
          appointmentDate: appointmentData.appointmentDate || 'MISSING'
        });
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
        duration: appointmentData.duration,
        type: appointmentData.type,
        reason: appointmentData.reason,
        notes: appointmentData.notes || '',
        status: appointmentData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'appointments'), firebaseAppointmentData);
      
      // Crear relación paciente-psicólogo para permitir acceso a moodLogs
      try {
        await createPatientRelation(userId, appointmentData.psychologistId);
        console.log('✅ Relación paciente-psicólogo creada');
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

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
};
