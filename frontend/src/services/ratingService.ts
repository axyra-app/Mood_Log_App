import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

export interface PsychologistRating {
  id: string;
  psychologistId: string;
  userId: string;
  rating: number; // 1-5 estrellas
  comment?: string;
  appointmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Crear una nueva calificación
export const createRating = async (ratingData: Omit<PsychologistRating, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const ratingsRef = collection(db, 'psychologistRatings');
    const docRef = await addDoc(ratingsRef, {
      ...ratingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

// Obtener calificaciones de un psicólogo
export const getPsychologistRatings = async (psychologistId: string): Promise<PsychologistRating[]> => {
  try {
    const ratingsRef = collection(db, 'psychologistRatings');
    const q = query(
      ratingsRef,
      where('psychologistId', '==', psychologistId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PsychologistRating[];
  } catch (error) {
    console.error('Error getting psychologist ratings:', error);
    throw error;
  }
};

// Calcular calificación promedio de un psicólogo
export const calculatePsychologistRating = async (psychologistId: string): Promise<{
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
}> => {
  try {
    const ratings = await getPsychologistRatings(psychologistId);
    
    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
    
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;
    
    const ratingDistribution = ratings.reduce((dist, rating) => {
      dist[rating.rating] = (dist[rating.rating] || 0) + 1;
      return dist;
    }, {} as { [key: number]: number });
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      totalRatings: ratings.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error calculating psychologist rating:', error);
    throw error;
  }
};

// Actualizar calificación promedio del psicólogo en su perfil
export const updatePsychologistRating = async (psychologistId: string): Promise<void> => {
  try {
    const ratingData = await calculatePsychologistRating(psychologistId);
    
    const psychologistRef = doc(db, 'psychologists', psychologistId);
    await updateDoc(psychologistRef, {
      rating: ratingData.averageRating,
      totalRatings: ratingData.totalRatings,
      ratingDistribution: ratingData.ratingDistribution,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating psychologist rating:', error);
    throw error;
  }
};

// Verificar si un usuario ya calificó a un psicólogo
export const hasUserRatedPsychologist = async (userId: string, psychologistId: string): Promise<boolean> => {
  try {
    const ratingsRef = collection(db, 'psychologistRatings');
    const q = query(
      ratingsRef,
      where('userId', '==', userId),
      where('psychologistId', '==', psychologistId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if user rated psychologist:', error);
    return false;
  }
};

// Obtener calificación de un usuario específico para un psicólogo
export const getUserRatingForPsychologist = async (userId: string, psychologistId: string): Promise<PsychologistRating | null> => {
  try {
    const ratingsRef = collection(db, 'psychologistRatings');
    const q = query(
      ratingsRef,
      where('userId', '==', userId),
      where('psychologistId', '==', psychologistId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as PsychologistRating;
  } catch (error) {
    console.error('Error getting user rating for psychologist:', error);
    return null;
  }
};
