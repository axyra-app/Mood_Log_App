import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface PsychologistAppointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  psychologistId: string;
  appointmentDate: Date;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const usePsychologistAppointments = (psychologistId: string) => {
  const [appointments, setAppointments] = useState<PsychologistAppointment[]>([]);
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
      orderBy('appointmentDate', 'desc')
    );

    const unsubscribe = onSnapshot(appointmentsQuery, 
      async (snapshot) => {
        try {
          const appointmentsData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              
              // Obtener información del usuario
              const userQuery = query(
                collection(db, 'users'),
                where('__name__', '==', data.userId)
              );
              const userSnapshot = await getDocs(userQuery);
              const userData = userSnapshot.empty ? 
                null : 
                userSnapshot.docs[0].data();
              
              // Si no hay datos de usuario, omitir esta cita
              if (!userData) return null;
              
              return {
                id: doc.id,
                userId: data.userId,
                userName: userData.displayName || 'Usuario',
                userEmail: userData.email || '',
                psychologistId: data.psychologistId,
                appointmentDate: data.appointmentDate?.toDate(),
                duration: data.duration || 60,
                type: data.type || 'consultation',
                reason: data.reason || '',
                notes: data.notes || '',
                status: data.status || 'pending',
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
              };
            })
          );
          
          setAppointments(appointmentsData.filter(appointment => appointment !== null));
          setError(null);
        } catch (err) {
          console.error('Error processing appointments:', err);
          setError('Error al cargar las citas');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in appointments listener:', err);
        setError('Error al cargar las citas');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [psychologistId]);

  const updateAppointmentStatus = async (appointmentId: string, status: 'accepted' | 'rejected' | 'completed' | 'cancelled', notes?: string) => {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(doc(db, 'appointments', appointmentId), updateData);
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const getPendingAppointments = () => {
    return getAppointmentsByStatus('pending');
  };

  const getAcceptedAppointments = () => {
    return getAppointmentsByStatus('accepted');
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(appointment => 
      appointment.status === 'accepted' && 
      appointment.appointmentDate > now
    );
  };

  const getStatistics = () => {
    return {
      total: appointments.length,
      pending: getAppointmentsByStatus('pending').length,
      accepted: getAppointmentsByStatus('accepted').length,
      rejected: getAppointmentsByStatus('rejected').length,
      completed: getAppointmentsByStatus('completed').length,
      cancelled: getAppointmentsByStatus('cancelled').length,
      upcoming: getUpcomingAppointments().length,
    };
  };

  return {
    appointments,
    loading,
    error,
    updateAppointmentStatus,
    getAppointmentsByStatus,
    getPendingAppointments,
    getAcceptedAppointments,
    getUpcomingAppointments,
    getStatistics,
  };
};
