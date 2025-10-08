import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Appointment } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar citas
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('appointmentDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        appointmentDate: doc.data().appointmentDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Appointment[];
      
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err instanceof Error ? err.message : 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear cita
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  }, []);

  // Actualizar cita
  const updateAppointment = useCallback(async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  }, []);

  // Eliminar cita
  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  }, []);

  // Suscripción en tiempo real
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, orderBy('appointmentDate', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appointmentDate: doc.data().appointmentDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Appointment[];
        
        setAppointments(appointmentsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error in appointments subscription:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loadAppointments,
  };
};