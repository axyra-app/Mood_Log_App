import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface MedicalReport {
  id: string;
  userId: string;
  userName: string;
  psychologistId: string;
  psychologistName: string;
  sessionDate: string;
  sessionType: 'individual' | 'group' | 'emergency' | 'follow-up';
  diagnosis?: string;
  symptoms: string[];
  treatment: string;
  progress: 'improved' | 'stable' | 'worsened' | 'new';
  notes: string;
  recommendations: string[];
  nextAppointment?: string;
  moodScore?: number;
  anxietyLevel?: number;
  depressionLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientHistory {
  userId: string;
  userName: string;
  totalSessions: number;
  firstSession: Date;
  lastSession: Date;
  averageMoodScore: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  reports: MedicalReport[];
}

export const useMedicalReports = (psychologistId: string) => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    const reportsQuery = query(
      collection(db, 'medicalReports'),
      where('psychologistId', '==', psychologistId),
      orderBy('sessionDate', 'desc')
    );

    const unsubscribe = onSnapshot(reportsQuery,
      async (snapshot) => {
        try {
          const reportsData: MedicalReport[] = [];
          
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            
            // Obtener información del usuario
            const userQuery = query(
              collection(db, 'users'),
              where('__name__', '==', data.userId),
              limit(1)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              
              reportsData.push({
                id: docSnapshot.id,
                userId: data.userId,
                userName: userData.displayName || userData.username || 'Usuario',
                psychologistId: data.psychologistId,
                psychologistName: data.psychologistName || '',
                sessionDate: data.sessionDate,
                sessionType: data.sessionType || 'individual',
                diagnosis: data.diagnosis || '',
                symptoms: data.symptoms || [],
                treatment: data.treatment || '',
                progress: data.progress || 'stable',
                notes: data.notes || '',
                recommendations: data.recommendations || [],
                nextAppointment: data.nextAppointment || '',
                moodScore: data.moodScore || 0,
                anxietyLevel: data.anxietyLevel || 0,
                depressionLevel: data.depressionLevel || 0,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              });
            }
          }
          
          setReports(reportsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching medical reports:', err);
          setError('Error al cargar los reportes médicos');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in medical reports listener:', err);
        setError('Error en la conexión de reportes médicos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [psychologistId]);

  const createMedicalReport = async (
    userId: string,
    sessionData: Omit<MedicalReport, 'id' | 'userName' | 'psychologistName' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      console.log('📋 Creating medical report:', { userId, psychologistId });
      
      // Obtener información del psicólogo usando doc() en lugar de query
      let psychologistName = 'Psicólogo';
      try {
        const psychologistDoc = await getDoc(doc(db, 'users', psychologistId));
        if (psychologistDoc.exists()) {
          psychologistName = psychologistDoc.data().displayName || 'Psicólogo';
        }
      } catch (psychologistError) {
        console.warn('Could not fetch psychologist name:', psychologistError);
      }

      // Obtener información del usuario usando doc() en lugar de query
      let userName = 'Usuario';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userName = userDoc.data().displayName || 'Usuario';
        }
      } catch (userError) {
        console.warn('Could not fetch user name:', userError);
      }

      const reportData = {
        ...sessionData,
        userName,
        psychologistName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('📋 Medical report data:', reportData);

      const docRef = await addDoc(collection(db, 'medicalReports'), reportData);
      console.log('✅ Medical report created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating medical report:', error);
      throw error;
    }
  };

  const getPatientHistory = (userId: string): PatientHistory | null => {
    const patientReports = reports.filter(report => report.userId === userId);
    
    if (patientReports.length === 0) return null;

    const sortedReports = patientReports.sort((a, b) => 
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

    const totalSessions = patientReports.length;
    const firstSession = sortedReports[0].createdAt;
    const lastSession = sortedReports[sortedReports.length - 1].createdAt;
    
    const averageMoodScore = patientReports.reduce((sum, report) => 
      sum + (report.moodScore || 0), 0
    ) / totalSessions;

    // Calcular tendencia de progreso
    const recentReports = sortedReports.slice(-3); // Últimos 3 reportes
    const recentMoodScores = recentReports.map(r => r.moodScore || 0);
    const progressTrend = recentMoodScores.length >= 2 
      ? recentMoodScores[recentMoodScores.length - 1] > recentMoodScores[0] 
        ? 'improving' 
        : recentMoodScores[recentMoodScores.length - 1] < recentMoodScores[0] 
          ? 'declining' 
          : 'stable'
      : 'stable';

    return {
      userId,
      userName: patientReports[0].userName,
      totalSessions,
      firstSession,
      lastSession,
      averageMoodScore,
      progressTrend,
      reports: sortedReports,
    };
  };

  const getReportsByPatient = (userId: string) => {
    return reports.filter(report => report.userId === userId);
  };

  const getReportsByDateRange = (startDate: string, endDate: string) => {
    return reports.filter(report => 
      report.sessionDate >= startDate && report.sessionDate <= endDate
    );
  };

  const getReportsByProgress = (progress: MedicalReport['progress']) => {
    return reports.filter(report => report.progress === progress);
  };

  return {
    reports,
    loading,
    error,
    createMedicalReport,
    getPatientHistory,
    getReportsByPatient,
    getReportsByDateRange,
    getReportsByProgress,
  };
};