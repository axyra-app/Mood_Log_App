import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Patient {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  createdAt: any;
  lastSeen: any;
  moodLogs?: any[];
  appointments?: any[];
}

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  averageMood: number;
  riskPatients: number;
  patientsNeedingAttention: number;
}

export const usePatients = (psychologistId: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener pacientes que tienen citas con este psicólogo
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('psychologistId', '==', psychologistId),
          orderBy('createdAt', 'desc')
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const patientIds = new Set<string>();
        
        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId) {
            patientIds.add(data.userId);
          }
        });

        // Obtener información de los pacientes
        const patientsData: Patient[] = [];
        
        for (const patientId of patientIds) {
          try {
            const userQuery = query(
              collection(db, 'users'),
              where('__name__', '==', patientId),
              limit(1)
            );
            
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              const userDoc = userSnapshot.docs[0];
              const userData = userDoc.data() as Patient;
              patientsData.push({
                ...userData,
                uid: userDoc.id,
              });
            }
          } catch (userError) {
            console.error(`Error fetching user ${patientId}:`, userError);
          }
        }

        // Obtener logs de estado de ánimo para cada paciente
        for (const patient of patientsData) {
          try {
            const moodQuery = query(
              collection(db, 'moodLogs'),
              where('userId', '==', patient.uid),
              orderBy('createdAt', 'desc'),
              limit(10)
            );
            
            const moodSnapshot = await getDocs(moodQuery);
            patient.moodLogs = moodSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } catch (moodError) {
            console.error(`Error fetching mood logs for ${patient.uid}:`, moodError);
            patient.moodLogs = [];
          }
        }

        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Error al cargar los pacientes');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [psychologistId]);

  const getStatistics = (): PatientStats => {
    if (patients.length === 0) {
      return {
        totalPatients: 0,
        activePatients: 0,
        averageMood: 0,
        riskPatients: 0,
        patientsNeedingAttention: 0,
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalMoodSum = 0;
    let moodCount = 0;
    let riskPatients = 0;
    let patientsNeedingAttention = 0;
    let activePatients = 0;

    patients.forEach(patient => {
      // Calcular pacientes activos (actividad en últimos 30 días)
      if (patient.lastSeen) {
        const lastSeenDate = patient.lastSeen.toDate ? patient.lastSeen.toDate() : new Date(patient.lastSeen);
        if (lastSeenDate > thirtyDaysAgo) {
          activePatients++;
        }
      }

      // Calcular estado de ánimo promedio
      if (patient.moodLogs && patient.moodLogs.length > 0) {
        const recentMoods = patient.moodLogs.filter(log => {
          const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
          return logDate > sevenDaysAgo;
        });

        if (recentMoods.length > 0) {
          const patientMoodSum = recentMoods.reduce((sum, log) => sum + (log.mood || 0), 0);
          const patientMoodAvg = patientMoodSum / recentMoods.length;
          
          totalMoodSum += patientMoodAvg;
          moodCount++;

          // Detectar pacientes en riesgo (estado de ánimo bajo)
          if (patientMoodAvg <= 2) {
            riskPatients++;
          }

          // Detectar pacientes que necesitan atención (sin actividad reciente pero con estado bajo)
          if (patient.lastSeen) {
            const lastSeenDate = patient.lastSeen.toDate ? patient.lastSeen.toDate() : new Date(patient.lastSeen);
            if (lastSeenDate < sevenDaysAgo && patientMoodAvg <= 3) {
              patientsNeedingAttention++;
            }
          }
        }
      }
    });

    return {
      totalPatients: patients.length,
      activePatients,
      averageMood: moodCount > 0 ? totalMoodSum / moodCount : 0,
      riskPatients,
      patientsNeedingAttention,
    };
  };

  const getPatientsByRiskLevel = (riskLevel: 'high' | 'medium' | 'low'): Patient[] => {
    return patients.filter(patient => {
      if (!patient.moodLogs || patient.moodLogs.length === 0) return false;

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentMoods = patient.moodLogs.filter(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate > sevenDaysAgo;
      });

      if (recentMoods.length === 0) return false;

      const patientMoodAvg = recentMoods.reduce((sum, log) => sum + (log.mood || 0), 0) / recentMoods.length;

      switch (riskLevel) {
        case 'high':
          return patientMoodAvg <= 2;
        case 'medium':
          return patientMoodAvg > 2 && patientMoodAvg <= 4;
        case 'low':
          return patientMoodAvg > 4;
        default:
          return false;
      }
    });
  };

  const getPatientsNeedingAttention = (): Patient[] => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return patients.filter(patient => {
      if (!patient.lastSeen || !patient.moodLogs || patient.moodLogs.length === 0) return false;

      const lastSeenDate = patient.lastSeen.toDate ? patient.lastSeen.toDate() : new Date(patient.lastSeen);
      if (lastSeenDate >= sevenDaysAgo) return false; // Activo recientemente

      const recentMoods = patient.moodLogs.filter(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate > sevenDaysAgo;
      });

      if (recentMoods.length === 0) return false;

      const patientMoodAvg = recentMoods.reduce((sum, log) => sum + (log.mood || 0), 0) / recentMoods.length;
      return patientMoodAvg <= 3; // Estado de ánimo bajo
    });
  };

  return {
    patients,
    loading,
    error,
    getStatistics,
    getPatientsByRiskLevel,
    getPatientsNeedingAttention,
  };
};