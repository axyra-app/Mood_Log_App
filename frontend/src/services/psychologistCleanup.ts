import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from './firebase';

// Función para limpiar datos corruptos de psicólogos
export const cleanupCorruptedPsychologists = async (): Promise<void> => {
  try {
    const psychologistsRef = collection(db, 'psychologists');
    const q = query(psychologistsRef);
    const querySnapshot = await getDocs(q);

    let cleanedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const psychologistData = docSnapshot.data();
      
      // Verificar si el psicólogo tiene datos corruptos
      if (!psychologistData.userId || 
          !psychologistData.name || 
          psychologistData.userId === '') {
        
        try {
          await deleteDoc(doc(db, 'psychologists', docSnapshot.id));
          cleanedCount++;
        } catch (error) {
          console.error(`❌ Error eliminando psicólogo ${docSnapshot.id}:`, error);
        }
      }
    }

    // Limpieza completada
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
};

// Función para verificar el estado de los psicólogos
export const checkPsychologistsHealth = async (): Promise<{
  total: number;
  valid: number;
  corrupted: number;
  corruptedIds: string[];
}> => {
  try {
    // Verificando estado de los psicólogos...

    const psychologistsRef = collection(db, 'psychologists');
    const q = query(psychologistsRef);
    const querySnapshot = await getDocs(q);

    let validCount = 0;
    let corruptedCount = 0;
    const corruptedIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (!data.userId || !data.name || data.userId === '') {
        corruptedCount++;
        corruptedIds.push(doc.id);
        // Psicólogo corrupto encontrado
      } else {
        validCount++;
      }
    });

    const result = {
      total: querySnapshot.size,
      valid: validCount,
      corrupted: corruptedCount,
      corruptedIds,
    };

    // Estado de psicólogos verificado
    return result;
  } catch (error) {
    console.error('❌ Error verificando estado de psicólogos:', error);
    throw error;
  }
};
