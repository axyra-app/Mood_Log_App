import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs, limit, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId: string;
  psychologistName: string;
  date: string;
  time: string;
  duration: number; // en minutos
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useAppointments = (psychologistId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('psychologistId', '==', psychologistId),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(appointmentsQuery,
      async (snapshot) => {
        try {
          const appointmentsData: Appointment[] = [];
          
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            
            // Obtener información del usuario
            const userQuery = query(
              collection(db, 'users'),
              where('__name__', '==', data.userId),
              limit(1)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              
              appointmentsData.push({
                id: docSnapshot.id,
                userId: data.userId,
                userName: userData.displayName || userData.username || 'Usuario',
                userEmail: userData.email || '',
                psychologistId: data.psychologistId,
                psychologistName: data.psychologistName || '',
                date: data.date,
                time: data.time,
                duration: data.duration || 60,
                status: data.status || 'pending',
                notes: data.notes || '',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              });
            }
          }
          
          setAppointments(appointmentsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          setError('Error al cargar las citas');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in appointments listener:', err);
        setError('Error en la conexión de citas');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [psychologistId]);

  const createAppointment = async (appointmentData: {
    patientId: string;
    psychologistId: string;
    appointmentDate: Date;
    duration: number;
    type: string;
    notes: string;
    status: string;
  }) => {
    try {
      // Log temporal para debugging
      console.log('createAppointment called with:', appointmentData);
      
      // Validar parámetros requeridos
      if (!appointmentData.patientId || !appointmentData.psychologistId || !appointmentData.appointmentDate) {
        console.log('Validation failed:', {
          patientId: appointmentData.patientId,
          psychologistId: appointmentData.psychologistId,
          appointmentDate: appointmentData.appointmentDate
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
        const userDoc = await getDoc(doc(db, 'users', appointmentData.patientId));
        if (userDoc.exists()) {
          userName = userDoc.data().displayName || 'Usuario';
        }
      } catch (userError) {
        // Silenciar error, usar nombre por defecto
      }

      const firebaseAppointmentData = {
        userId: appointmentData.patientId,
        userName,
        psychologistId: appointmentData.psychologistId,
        psychologistName,
        date: appointmentData.appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD
        time: appointmentData.appointmentDate.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
        duration: appointmentData.duration,
        type: appointmentData.type,
        status: appointmentData.status,
        notes: appointmentData.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'appointments'), firebaseAppointmentData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status'], notes?: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  };

  const getAppointmentsByStatus = (status: Appointment['status']) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.date >= today && 
      (appointment.status === 'accepted' || appointment.status === 'pending')
    );
  };

  const getPendingAppointments = () => {
    return appointments.filter(appointment => appointment.status === 'pending');
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointmentStatus,
    getAppointmentsByStatus,
    getAppointmentsByDate,
    getUpcomingAppointments,
    getPendingAppointments,
  };
};