import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { db } from './services/firebase';

// Script para actualizar sesiones existentes
export const updateExistingChatSessions = async () => {
  try {
    console.log('🔄 Actualizando sesiones de chat existentes...');

    // Obtener todas las sesiones de chat
    const sessionsQuery = query(collection(db, 'chatSessions'));
    const sessionsSnapshot = await getDocs(sessionsQuery);

    let updatedCount = 0;

    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionData = sessionDoc.data();

      // Si no tiene el campo participants, agregarlo
      if (!sessionData.participants) {
        const participants = [sessionData.userId, sessionData.psychologistId];

        await updateDoc(doc(db, 'chatSessions', sessionDoc.id), {
          participants: participants,
        });

        updatedCount++;
        console.log(`✅ Sesión ${sessionDoc.id} actualizada con participants:`, participants);
      }
    }

    console.log(`🎉 Actualización completada. ${updatedCount} sesiones actualizadas.`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Error actualizando sesiones:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
(window as any).updateChatSessions = updateExistingChatSessions;
