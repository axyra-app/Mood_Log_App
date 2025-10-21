import { collection, query, where, getDocs, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Appointment {
  id: string;
  userId: string;
  psychologistId: string;
  psychologistName: string;
  appointmentDate: Date;
  appointmentTime?: string;
  duration: number;
  type: string;
  reason: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

class AppointmentCleanupService {
  /**
   * Elimina citas del usuario actual que han pasado más de 3 días de su fecha programada
   */
  async cleanupExpiredAppointments(userId: string): Promise<number> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Solo buscar citas del usuario actual
      const userAppointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        where('appointmentDate', '<', Timestamp.fromDate(threeDaysAgo)),
        where('status', 'in', ['completed', 'cancelled', 'expired'])
      );
      
      const userAppointmentsSnapshot = await getDocs(userAppointmentsQuery);
      let deletedCount = 0;
      
      // Eliminar solo las citas del usuario actual
      for (const docSnapshot of userAppointmentsSnapshot.docs) {
        try {
          await deleteDoc(doc(db, 'appointments', docSnapshot.id));
          deletedCount++;
        } catch (error) {
          console.error(`Error eliminando cita del usuario ${docSnapshot.id}:`, error);
        }
      }
      
      return deletedCount;
      
    } catch (error) {
      console.error('Error durante la limpieza de citas:', error);
      return 0;
    }
  }
  
  /**
   * Marca citas del usuario actual como expiradas si han pasado su fecha
   */
  async markExpiredAppointments(userId: string): Promise<number> {
    try {
      const now = new Date();
      
      // Solo buscar citas del usuario actual
      const expiredQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        where('appointmentDate', '<', Timestamp.fromDate(now)),
        where('status', 'in', ['pending', 'accepted'])
      );
      
      const expiredSnapshot = await getDocs(expiredQuery);
      let markedCount = 0;
      
      for (const docSnapshot of expiredSnapshot.docs) {
        try {
          await updateDoc(doc(db, 'appointments', docSnapshot.id), {
            status: 'expired',
            updatedAt: Timestamp.now()
          });
          markedCount++;
        } catch (error) {
          console.error(`Error marcando cita como expirada ${docSnapshot.id}:`, error);
        }
      }
      
      return markedCount;
      
    } catch (error) {
      console.error('Error marcando citas como expiradas:', error);
      return 0;
    }
  }
  
  /**
   * Ejecuta la limpieza completa para el usuario actual
   */
  async runFullCleanup(userId: string): Promise<{ marked: number; deleted: number }> {
    try {
      const marked = await this.markExpiredAppointments(userId);
      const deleted = await this.cleanupExpiredAppointments(userId);
      
      return { marked, deleted };
    } catch (error) {
      console.error('Error en limpieza completa:', error);
      return { marked: 0, deleted: 0 };
    }
  }
}

export const appointmentCleanupService = new AppointmentCleanupService();

// Función para ejecutar limpieza automática (requiere userId)
export const runAppointmentCleanup = async (userId: string) => {
  try {
    const result = await appointmentCleanupService.runFullCleanup(userId);
    return result;
  } catch (error) {
    console.error('Error ejecutando limpieza automática:', error);
    return { marked: 0, deleted: 0 };
  }
};
