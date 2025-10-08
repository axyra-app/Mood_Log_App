import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MedicalReport } from '../types';

export const useMedicalReports = () => {
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar reportes médicos
  const loadMedicalReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reportsRef = collection(db, 'medicalReports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        nextAppointment: doc.data().nextAppointment?.toDate() || undefined,
      })) as MedicalReport[];
      
      setMedicalReports(reportsData);
    } catch (err) {
      console.error('Error loading medical reports:', err);
      setError(err instanceof Error ? err.message : 'Error loading medical reports');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear reporte médico
  const createMedicalReport = useCallback(async (reportData: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const reportsRef = collection(db, 'medicalReports');
      const docRef = await addDoc(reportsRef, {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (err) {
      console.error('Error creating medical report:', err);
      throw err;
    }
  }, []);

  // Actualizar reporte médico
  const updateMedicalReport = useCallback(async (reportId: string, updates: Partial<MedicalReport>) => {
    try {
      const reportRef = doc(db, 'medicalReports', reportId);
      await updateDoc(reportRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating medical report:', err);
      throw err;
    }
  }, []);

  // Eliminar reporte médico
  const deleteMedicalReport = useCallback(async (reportId: string) => {
    try {
      const reportRef = doc(db, 'medicalReports', reportId);
      await deleteDoc(reportRef);
    } catch (err) {
      console.error('Error deleting medical report:', err);
      throw err;
    }
  }, []);

  // Suscripción en tiempo real
  useEffect(() => {
    const reportsRef = collection(db, 'medicalReports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          nextAppointment: doc.data().nextAppointment?.toDate() || undefined,
        })) as MedicalReport[];
        
        setMedicalReports(reportsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error in medical reports subscription:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    medicalReports,
    loading,
    error,
    createMedicalReport,
    updateMedicalReport,
    deleteMedicalReport,
    loadMedicalReports,
  };
};