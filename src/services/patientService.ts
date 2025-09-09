import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Appointment, Patient, SessionNote, TreatmentPlan } from '../types';
import { db } from './firebase';

// Patient Management Functions
export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const patientsRef = collection(db, 'patients');
    const docRef = await addDoc(patientsRef, {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (patientSnap.exists()) {
      return { id: patientSnap.id, ...patientSnap.data() } as Patient;
    }
    return null;
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

export const getPatientsByPsychologist = async (psychologistId: string): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('psychologistId', '==', psychologistId), orderBy('updatedAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Patient[];
  } catch (error) {
    console.error('Error getting patients by psychologist:', error);
    throw error;
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deletePatient = async (patientId: string): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await deleteDoc(patientRef);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Real-time patient updates
export const subscribeToPatients = (psychologistId: string, callback: (patients: Patient[]) => void) => {
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('psychologistId', '==', psychologistId), orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const patients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Patient[];
    callback(patients);
  });
};

// Session Notes Functions
export const createSessionNote = async (
  sessionData: Omit<SessionNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const sessionsRef = collection(db, 'sessionNotes');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating session note:', error);
    throw error;
  }
};

export const getSessionNotes = async (patientId: string): Promise<SessionNote[]> => {
  try {
    const sessionsRef = collection(db, 'sessionNotes');
    const q = query(sessionsRef, where('patientId', '==', patientId), orderBy('sessionDate', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SessionNote[];
  } catch (error) {
    console.error('Error getting session notes:', error);
    throw error;
  }
};

export const updateSessionNote = async (sessionId: string, updates: Partial<SessionNote>): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessionNotes', sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating session note:', error);
    throw error;
  }
};

export const deleteSessionNote = async (noteId: string): Promise<void> => {
  try {
    const noteRef = doc(db, 'sessionNotes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting session note:', error);
    throw error;
  }
};

// Treatment Plan Functions
export const createTreatmentPlan = async (
  planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const plansRef = collection(db, 'treatmentPlans');
    const docRef = await addDoc(plansRef, {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    throw error;
  }
};

export const getTreatmentPlans = async (patientId: string): Promise<TreatmentPlan[]> => {
  try {
    const plansRef = collection(db, 'treatmentPlans');
    const q = query(plansRef, where('patientId', '==', patientId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TreatmentPlan[];
  } catch (error) {
    console.error('Error getting treatment plans:', error);
    throw error;
  }
};

export const updateTreatmentPlan = async (planId: string, updates: Partial<TreatmentPlan>): Promise<void> => {
  try {
    const planRef = doc(db, 'treatmentPlans', planId);
    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    throw error;
  }
};

export const deleteTreatmentPlan = async (planId: string): Promise<void> => {
  try {
    const planRef = doc(db, 'treatmentPlans', planId);
    await deleteDoc(planRef);
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    throw error;
  }
};

// Appointment Functions
export const createAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointments = async (
  psychologistId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    let q = query(appointmentsRef, where('psychologistId', '==', psychologistId), orderBy('startTime', 'asc'));

    if (startDate) {
      q = query(q, where('startTime', '>=', startDate));
    }

    if (endDate) {
      q = query(q, where('startTime', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Real-time appointment updates
export const subscribeToAppointments = (psychologistId: string, callback: (appointments: Appointment[]) => void) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('psychologistId', '==', psychologistId), orderBy('startTime', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    callback(appointments);
  });
};

// Patient Statistics
export const getPatientStatistics = async (patientId: string) => {
  try {
    const [sessionNotes, treatmentPlans, appointments] = await Promise.all([
      getSessionNotes(patientId),
      getTreatmentPlans(patientId),
      getAppointmentsByPatient(patientId),
    ]);

    const totalSessions = sessionNotes.length;
    const activePlans = treatmentPlans.filter((plan) => plan.status === 'active').length;
    const upcomingAppointments = appointments.filter(
      (apt) => apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;

    const averageMoodBefore = sessionNotes.reduce((sum, note) => sum + note.moodBefore, 0) / totalSessions || 0;
    const averageMoodAfter = sessionNotes.reduce((sum, note) => sum + note.moodAfter, 0) / totalSessions || 0;
    const averageProgress = sessionNotes.reduce((sum, note) => sum + note.progress, 0) / totalSessions || 0;

    return {
      totalSessions,
      activePlans,
      upcomingAppointments,
      averageMoodBefore,
      averageMoodAfter,
      averageProgress,
      moodImprovement: averageMoodAfter - averageMoodBefore,
    };
  } catch (error) {
    console.error('Error getting patient statistics:', error);
    throw error;
  }
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('patientId', '==', patientId), orderBy('startTime', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments by patient:', error);
    throw error;
  }
};

// Batch operations for better performance
export const createPatientWithInitialData = async (
  patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  initialSessionNote?: Omit<SessionNote, 'id' | 'patientId' | 'psychologistId' | 'createdAt' | 'updatedAt'>,
  initialTreatmentPlan?: Omit<TreatmentPlan, 'id' | 'patientId' | 'psychologistId' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const batch = writeBatch(db);

    // Create patient
    const patientRef = doc(collection(db, 'patients'));
    batch.set(patientRef, {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create initial session note if provided
    if (initialSessionNote) {
      const sessionRef = doc(collection(db, 'sessionNotes'));
      batch.set(sessionRef, {
        ...initialSessionNote,
        patientId: patientRef.id,
        psychologistId: patientData.psychologistId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Create initial treatment plan if provided
    if (initialTreatmentPlan) {
      const planRef = doc(collection(db, 'treatmentPlans'));
      batch.set(planRef, {
        ...initialTreatmentPlan,
        patientId: patientRef.id,
        psychologistId: patientData.psychologistId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return patientRef.id;
  } catch (error) {
    console.error('Error creating patient with initial data:', error);
    throw error;
  }
};
