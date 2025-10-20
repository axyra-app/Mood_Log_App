import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface AvailablePsychologist {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  professionalTitle: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  licenseNumber: string;
  phone: string;
  rating: number;
  patientsCount: number;
  isAvailable: boolean;
  isOnline: boolean;
  lastSeen: Date;
}

export const useAvailablePsychologists = () => {
  const [psychologists, setPsychologists] = useState<AvailablePsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Escuchar cambios en psicólogos disponibles
    const psychologistsQuery = query(
      collection(db, 'psychologists')
    );

    const unsubscribe = onSnapshot(
      psychologistsQuery,
      async (snapshot) => {
        try {
          const psychologistsData: AvailablePsychologist[] = [];

          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            
            // Verificar estado online real basado en lastActive
            const lastActive = data.lastActive?.toDate();
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            
            // Está online si está marcado como online O si su última actividad fue hace menos de 5 minutos
            const isOnline = data.isOnline || (lastActive && lastActive > fiveMinutesAgo);
            
            psychologistsData.push({
              id: docSnapshot.id,
              userId: data.userId || docSnapshot.id,
              displayName: data.displayName || 'Psicólogo',
              email: data.email || '',
              professionalTitle: data.professionalTitle || 'Psicólogo',
              specialization: data.specialization || 'General',
              yearsOfExperience: data.yearsOfExperience || 0,
              bio: data.bio || '',
              licenseNumber: data.licenseNumber || '',
              phone: data.phone || '',
              rating: data.rating || 0,
              patientsCount: data.patientsCount || 0,
              isAvailable: true,
              isOnline: isOnline,
              lastSeen: new Date(),
            });
          }

          // Ordenar por disponibilidad (online primero) y luego por rating
          psychologistsData.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return b.rating - a.rating;
          });

          setPsychologists(psychologistsData);
          setError(null);
        } catch (err) {
          console.error('Error processing psychologists:', err);
          setError('Error al cargar psicólogos disponibles');
          setPsychologists([]);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in psychologists listener:', err);
        setError('Error en la conexión de psicólogos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updatePsychologistStatus = async (psychologistId: string, isOnline: boolean) => {
    try {
      const psychologistDoc = doc(db, 'psychologists', psychologistId);
      await updateDoc(psychologistDoc, {
        lastSeen: new Date(),
        isOnline,
      });
    } catch (error) {
      console.error('Error updating psychologist status:', error);
    }
  };

  return {
    psychologists,
    loading,
    error,
    updatePsychologistStatus,
  };
};
