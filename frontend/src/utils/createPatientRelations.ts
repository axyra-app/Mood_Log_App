import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './services/firebase';

// Script para crear relaciones paciente-psicólogo automáticamente
export const createPatientRelationsFromAppointments = async () => {
  try {
    console.log('🔄 Creando relaciones paciente-psicólogo desde citas existentes...');
    
    // Obtener todas las citas aceptadas
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'accepted')
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data();
      const { userId, psychologistId } = appointmentData;
      
      if (!userId || !psychologistId) {
        console.log('⚠️ Cita sin userId o psychologistId:', appointmentDoc.id);
        continue;
      }
      
      // Verificar si ya existe la relación
      const existingQuery = query(
        collection(db, 'patients'),
        where('userId', '==', userId),
        where('psychologistId', '==', psychologistId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        skippedCount++;
        console.log(`⏭️ Relación ya existe para usuario ${userId} y psicólogo ${psychologistId}`);
        continue;
      }
      
      // Obtener información del usuario
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.exists() ? userSnapshot.data() : null;
      
      // Obtener información del psicólogo
      const psychologistDoc = doc(db, 'psychologists', psychologistId);
      const psychologistSnapshot = await getDoc(psychologistDoc);
      const psychologistData = psychologistSnapshot.exists() ? psychologistSnapshot.data() : null;
      
      // Crear relación
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
      
      createdCount++;
      console.log(`✅ Relación creada: ${userData?.displayName || 'Usuario'} ↔ ${psychologistData?.displayName || 'Psicólogo'}`);
    }
    
    console.log(`🎉 Proceso completado. ${createdCount} relaciones creadas, ${skippedCount} omitidas.`);
    return { createdCount, skippedCount };
  } catch (error) {
    console.error('❌ Error creando relaciones:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
(window as any).createPatientRelations = createPatientRelationsFromAppointments;
