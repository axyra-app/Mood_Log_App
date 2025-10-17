import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Patient {
  id: string;
  userId: string;
  psychologistId: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  diagnosis?: string;
  treatmentStart?: Date;
  lastSession?: Date;
  nextAppointment?: Date;
  totalSessions: number;
  averageMood: number;
  lastMood: number;
  lastMoodDate?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  progress: number;
  notes?: string;
  emergencyContact?: string;
  medications?: string[];
  goals?: string[];
  moodHistory: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: number;
  energy?: number;
  stress?: number;
  sleep?: number;
  notes?: string;
  activities?: string[];
  emotions?: string[];
  createdAt: Date;
  aiAnalysis?: string;
}

// Obtener todos los pacientes de un psicólogo
export const getPatientsByPsychologist = async (psychologistId: string): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      where('psychologistId', '==', psychologistId),
      where('isActive', '==', true),
      orderBy('lastMoodDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const patients: Patient[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const patientData = docSnapshot.data();
      
      // Obtener datos del usuario
      const userRef = doc(db, 'users', patientData.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Obtener último mood log
        const moodLogsRef = collection(db, 'moodLogs');
        const moodQuery = query(
          moodLogsRef,
          where('userId', '==', patientData.userId),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const moodSnapshot = await getDocs(moodQuery);
        const lastMoodLog = moodSnapshot.docs[0]?.data() as MoodLog;
        
        // Obtener historial de mood (últimos 7 días)
        const moodHistoryQuery = query(
          moodLogsRef,
          where('userId', '==', patientData.userId),
          orderBy('createdAt', 'desc'),
          limit(7)
        );
        
        const moodHistorySnapshot = await getDocs(moodHistoryQuery);
        const moodHistory = moodHistorySnapshot.docs.map(doc => doc.data().mood);
        
        // Calcular estadísticas
        const allMoodLogsQuery = query(
          moodLogsRef,
          where('userId', '==', patientData.userId),
          orderBy('createdAt', 'desc')
        );
        
        const allMoodLogsSnapshot = await getDocs(allMoodLogsQuery);
        const allMoodLogs = allMoodLogsSnapshot.docs.map(doc => doc.data());
        
        const averageMood = allMoodLogs.length > 0 
          ? allMoodLogs.reduce((sum, log) => sum + log.mood, 0) / allMoodLogs.length 
          : 0;
        
        const riskLevel = determineRiskLevel(lastMoodLog, averageMood, allMoodLogs);
        
        const patient: Patient = {
          id: docSnapshot.id,
          userId: patientData.userId,
          psychologistId: patientData.psychologistId,
          name: userData.displayName || userData.username || 'Usuario',
          email: userData.email || '',
          phone: userData.phone || '',
          age: userData.age || 0,
          gender: userData.gender || '',
          diagnosis: patientData.diagnosis || '',
          treatmentStart: patientData.treatmentStart?.toDate() || new Date(),
          lastSession: patientData.lastSession?.toDate() || new Date(),
          nextAppointment: patientData.nextAppointment?.toDate(),
          totalSessions: patientData.totalSessions || 0,
          averageMood: Math.round(averageMood * 10) / 10,
          lastMood: lastMoodLog?.mood || 0,
          lastMoodDate: lastMoodLog?.createdAt?.toDate() || new Date(),
          riskLevel,
          progress: calculateProgress(allMoodLogs),
          notes: patientData.notes || '',
          emergencyContact: patientData.emergencyContact || '',
          medications: patientData.medications || [],
          goals: patientData.goals || [],
          moodHistory: moodHistory.length > 0 ? moodHistory : [0],
          isActive: patientData.isActive || true,
          createdAt: patientData.createdAt?.toDate() || new Date(),
          updatedAt: patientData.updatedAt?.toDate() || new Date(),
        };
        
        patients.push(patient);
      }
    }

    return patients;
  } catch (error) {
    console.error('Error getting patients by psychologist:', error);
    throw error;
  }
};

// Determinar nivel de riesgo basado en mood logs
const determineRiskLevel = (lastMoodLog: MoodLog | undefined, averageMood: number, allMoodLogs: any[]): 'low' | 'medium' | 'high' => {
  if (!lastMoodLog) return 'medium';
  
  // Factores de riesgo
  const lowMood = lastMoodLog.mood <= 2;
  const decliningTrend = allMoodLogs.length >= 3 && 
    allMoodLogs.slice(0, 3).every(log => log.mood < averageMood);
  const highStress = lastMoodLog.stress && lastMoodLog.stress >= 8;
  const poorSleep = lastMoodLog.sleep && lastMoodLog.sleep <= 3;
  const crisisKeywords = lastMoodLog.notes?.toLowerCase().includes('suicidio') || 
    lastMoodLog.notes?.toLowerCase().includes('morir') ||
    lastMoodLog.notes?.toLowerCase().includes('no vale la pena');
  
  if (crisisKeywords || (lowMood && highStress)) {
    return 'high';
  }
  
  if (lowMood || decliningTrend || (highStress && poorSleep)) {
    return 'medium';
  }
  
  return 'low';
};

// Calcular progreso basado en tendencia de mood
const calculateProgress = (allMoodLogs: any[]): number => {
  if (allMoodLogs.length < 2) return 0;
  
  const recent = allMoodLogs.slice(0, 7);
  const older = allMoodLogs.slice(7, 14);
  
  if (recent.length === 0 || older.length === 0) return 50;
  
  const recentAvg = recent.reduce((sum, log) => sum + log.mood, 0) / recent.length;
  const olderAvg = older.reduce((sum, log) => sum + log.mood, 0) / older.length;
  
  const improvement = recentAvg - olderAvg;
  const progress = Math.max(0, Math.min(100, 50 + (improvement * 20)));
  
  return Math.round(progress);
};

// Suscribirse a cambios en pacientes en tiempo real
export const subscribeToPatients = (psychologistId: string, callback: (patients: Patient[]) => void) => {
  const patientsRef = collection(db, 'patients');
  const q = query(
    patientsRef,
    where('psychologistId', '==', psychologistId),
    where('isActive', '==', true),
    orderBy('lastMoodDate', 'desc')
  );

  return onSnapshot(q, async (querySnapshot) => {
    const patients: Patient[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const patientData = docSnapshot.data();
      
      try {
        // Obtener datos del usuario
        const userRef = doc(db, 'users', patientData.userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Obtener último mood log
          const moodLogsRef = collection(db, 'moodLogs');
          const moodQuery = query(
            moodLogsRef,
            where('userId', '==', patientData.userId),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const moodSnapshot = await getDocs(moodQuery);
          const lastMoodLog = moodSnapshot.docs[0]?.data() as MoodLog;
          
          // Obtener historial de mood (últimos 7 días)
          const moodHistoryQuery = query(
            moodLogsRef,
            where('userId', '==', patientData.userId),
            orderBy('createdAt', 'desc'),
            limit(7)
          );
          
          const moodHistorySnapshot = await getDocs(moodHistoryQuery);
          const moodHistory = moodHistorySnapshot.docs.map(doc => doc.data().mood);
          
          // Calcular estadísticas
          const allMoodLogsQuery = query(
            moodLogsRef,
            where('userId', '==', patientData.userId),
            orderBy('createdAt', 'desc')
          );
          
          const allMoodLogsSnapshot = await getDocs(allMoodLogsQuery);
          const allMoodLogs = allMoodLogsSnapshot.docs.map(doc => doc.data());
          
          const averageMood = allMoodLogs.length > 0 
            ? allMoodLogs.reduce((sum, log) => sum + log.mood, 0) / allMoodLogs.length 
            : 0;
          
          const riskLevel = determineRiskLevel(lastMoodLog, averageMood, allMoodLogs);
          
          const patient: Patient = {
            id: docSnapshot.id,
            userId: patientData.userId,
            psychologistId: patientData.psychologistId,
            name: userData.displayName || userData.username || 'Usuario',
            email: userData.email || '',
            phone: userData.phone || '',
            age: userData.age || 0,
            gender: userData.gender || '',
            diagnosis: patientData.diagnosis || '',
            treatmentStart: patientData.treatmentStart?.toDate() || new Date(),
            lastSession: patientData.lastSession?.toDate() || new Date(),
            nextAppointment: patientData.nextAppointment?.toDate(),
            totalSessions: patientData.totalSessions || 0,
            averageMood: Math.round(averageMood * 10) / 10,
            lastMood: lastMoodLog?.mood || 0,
            lastMoodDate: lastMoodLog?.createdAt?.toDate() || new Date(),
            riskLevel,
            progress: calculateProgress(allMoodLogs),
            notes: patientData.notes || '',
            emergencyContact: patientData.emergencyContact || '',
            medications: patientData.medications || [],
            goals: patientData.goals || [],
            moodHistory: moodHistory.length > 0 ? moodHistory : [0],
            isActive: patientData.isActive || true,
            createdAt: patientData.createdAt?.toDate() || new Date(),
            updatedAt: patientData.updatedAt?.toDate() || new Date(),
          };
          
          patients.push(patient);
        }
      } catch (error) {
        console.error('Error processing patient:', error);
      }
    }
    
    callback(patients);
  });
};

// Actualizar notas del paciente
export const updatePatientNotes = async (patientId: string, notes: string): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      notes,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating patient notes:', error);
    throw error;
  }
};

// Actualizar próxima cita
export const updateNextAppointment = async (patientId: string, appointmentDate: Date): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      nextAppointment: appointmentDate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating next appointment:', error);
    throw error;
  }
};
