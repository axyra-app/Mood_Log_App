import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface PatientRelation {
  id: string;
  userId: string;
  psychologistId: string;
  userName: string;
  userEmail: string;
  psychologistName: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export const usePatientRelations = (psychologistId: string) => {
  const [relations, setRelations] = useState<PatientRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    const fetchRelations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todas las relaciones donde este psicólogo es el asignado
        const relationsQuery = query(
          collection(db, 'patients'),
          where('psychologistId', '==', psychologistId),
          where('status', '==', 'active')
        );

        const relationsSnapshot = await getDocs(relationsQuery);
        const relationsData: PatientRelation[] = [];

        for (const docSnapshot of relationsSnapshot.docs) {
          const data = docSnapshot.data();
          
          // Obtener información del usuario
          const userDoc = doc(db, 'users', data.userId);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            
            relationsData.push({
              id: docSnapshot.id,
              userId: data.userId,
              psychologistId: data.psychologistId,
              userName: userData.displayName || userData.username || 'Usuario',
              userEmail: userData.email || '',
              psychologistName: data.psychologistName || '',
              status: data.status || 'active',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            });
          }
        }

        setRelations(relationsData);
      } catch (err) {
        console.error('Error fetching patient relations:', err);
        setError('Error al cargar las relaciones de pacientes');
        setRelations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, [psychologistId]);

  const createPatientRelation = async (userId: string, psychologistId: string) => {
    try {
      // Verificar si ya existe la relación
      const existingQuery = query(
        collection(db, 'patients'),
        where('userId', '==', userId),
        where('psychologistId', '==', psychologistId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Actualizar relación existente
        const existingDoc = existingSnapshot.docs[0];
        await updateDoc(doc(db, 'patients', existingDoc.id), {
          status: 'active',
          updatedAt: new Date(),
        });
        return existingDoc.id;
      }

      // Obtener información del usuario
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.exists() ? userSnapshot.data() : null;

      // Obtener información del psicólogo
      const psychologistDoc = doc(db, 'psychologists', psychologistId);
      const psychologistSnapshot = await getDoc(psychologistDoc);
      const psychologistData = psychologistSnapshot.exists() ? psychologistSnapshot.data() : null;

      // Crear nueva relación
      const relationData = {
        userId,
        psychologistId,
        userName: userData?.displayName || userData?.username || 'Usuario',
        userEmail: userData?.email || '',
        psychologistName: psychologistData?.displayName || psychologistData?.name || 'Psicólogo',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = doc(collection(db, 'patients'));
      await setDoc(docRef, relationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient relation:', error);
      throw error;
    }
  };

  const updatePatientRelation = async (relationId: string, updates: Partial<PatientRelation>) => {
    try {
      await updateDoc(doc(db, 'patients', relationId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating patient relation:', error);
      throw error;
    }
  };

  return {
    relations,
    loading,
    error,
    createPatientRelation,
    updatePatientRelation,
  };
};
