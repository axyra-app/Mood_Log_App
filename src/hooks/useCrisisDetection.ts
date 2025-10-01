import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CrisisAssessment, detectCrisisSignals, getRecentCrisisAssessments } from '../services/crisisDetection';
import { db } from '../services/firebase';

interface UseCrisisDetectionReturn {
  currentAssessment: CrisisAssessment | null;
  recentAssessments: CrisisAssessment[];
  isLoading: boolean;
  error: string | null;
  assessMoodData: (moodData: any) => Promise<void>;
  dismissAlert: () => void;
  contactPsychologist: () => void;
  emergencyContact: () => void;
}

export const useCrisisDetection = (): UseCrisisDetectionReturn => {
  const { user } = useAuth();
  const [currentAssessment, setCurrentAssessment] = useState<CrisisAssessment | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<CrisisAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para evaluar datos de mood
  const assessMoodData = useCallback(
    async (moodData: any) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Obtener historial reciente para contexto
        const recentHistory = await getRecentMoodHistory(user.uid);

        // Realizar evaluación de crisis
        const assessment = await detectCrisisSignals(user.uid, moodData, recentHistory);

        // Solo mostrar alertas de riesgo medio o superior
        if (assessment.overallRisk !== 'low') {
          setCurrentAssessment(assessment);

          // Notificar a psicólogo si es necesario
          if (assessment.psychologistNotification) {
            await notifyPsychologist(user.uid, assessment);
          }
        }

        // Actualizar historial de evaluaciones
        await updateRecentAssessments(user.uid);
      } catch (err) {
        console.error('Error en evaluación de crisis:', err);
        setError('Error al evaluar el estado de crisis');
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Función para obtener historial de mood
  const getRecentMoodHistory = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error obteniendo historial de mood:', error);
      return [];
    }
  };

  // Función para notificar psicólogo
  const notifyPsychologist = async (userId: string, assessment: CrisisAssessment) => {
    try {
      // Buscar psicólogo asignado
      const patientQuery = query(
        collection(db, 'patients'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const patientSnapshot = await getDocs(patientQuery);

      if (!patientSnapshot.empty) {
        const patientData = patientSnapshot.docs[0].data();
        const psychologistId = patientData.psychologistId;

        if (psychologistId) {
          // Crear alerta de crisis
          await addDoc(collection(db, 'crisisAlerts'), {
            userId,
            psychologistId,
            assessment,
            urgency: assessment.overallRisk,
            createdAt: new Date(),
            resolved: false,
            notificationSent: true,
            message: `Alerta de crisis detectada para paciente. Riesgo: ${assessment.overallRisk}`,
          });

          // Crear notificación para el psicólogo
          await addDoc(collection(db, 'notifications'), {
            userId: psychologistId,
            title: '🚨 Alerta de Crisis',
            message: `Se ha detectado una crisis en uno de tus pacientes. Riesgo: ${assessment.overallRisk}`,
            type: 'crisis',
            priority: assessment.overallRisk === 'critical' ? 'urgent' : 'high',
            read: false,
            createdAt: new Date(),
            actionUrl: `/psychologist/patients/${userId}`,
            metadata: {
              patientId: userId,
              assessmentId: assessment.signals[0]?.id,
              riskLevel: assessment.overallRisk,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error notificando psicólogo:', error);
    }
  };

  // Función para actualizar evaluaciones recientes
  const updateRecentAssessments = async (userId: string) => {
    try {
      const assessments = await getRecentCrisisAssessments(userId, 5);
      setRecentAssessments(assessments);
    } catch (error) {
      console.error('Error actualizando evaluaciones recientes:', error);
    }
  };

  // Función para descartar alerta
  const dismissAlert = useCallback(() => {
    setCurrentAssessment(null);
  }, []);

  // Función para contactar psicólogo
  const contactPsychologist = useCallback(() => {
    // Implementar lógica para contactar psicólogo
    console.log('Contactando psicólogo...');
    setCurrentAssessment(null);
  }, []);

  // Función para contacto de emergencia
  const emergencyContact = useCallback(() => {
    // Implementar lógica para contacto de emergencia
    console.log('Contacto de emergencia...');
    setCurrentAssessment(null);
  }, []);

  // Efecto para escuchar cambios en evaluaciones de crisis
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'crisisAssessments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const assessments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CrisisAssessment[];

      setRecentAssessments(assessments);
    });

    return () => unsubscribe();
  }, [user]);

  // Efecto para limpiar errores después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    currentAssessment,
    recentAssessments,
    isLoading,
    error,
    assessMoodData,
    dismissAlert,
    contactPsychologist,
    emergencyContact,
  };
};
