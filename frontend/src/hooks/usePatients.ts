import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Patient } from '../types';

export const usePatients = (psychologistId: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pacientes
  const loadPatients = useCallback(async () => {
    if (!psychologistId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const patientsRef = collection(db, 'patients');
      const q = query(
        patientsRef, 
        where('psychologistId', '==', psychologistId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Patient[];
      
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Error loading patients');
    } finally {
      setLoading(false);
    }
  }, [psychologistId]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!psychologistId) return;
    
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef, 
      where('psychologistId', '==', psychologistId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Patient[];
        
        setPatients(patientsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error in patients subscription:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [psychologistId]);

  return {
    patients,
    loading,
    error,
    loadPatients,
  };
};