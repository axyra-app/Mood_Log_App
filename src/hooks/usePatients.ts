import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Patient, getPatientsByPsychologist, subscribeToPatients, updatePatientNotes, updateNextAppointment } from '../services/patientService';

export const usePatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patients
  const loadPatients = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const patientsData = await getPatientsByPsychologist(user.uid);
      setPatients(patientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading patients');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Update patient notes
  const updateNotes = useCallback(async (patientId: string, notes: string) => {
    try {
      await updatePatientNotes(patientId, notes);
      // Reload patients to get updated data
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating notes');
      throw err;
    }
  }, [loadPatients]);

  // Update next appointment
  const updateAppointment = useCallback(async (patientId: string, appointmentDate: Date) => {
    try {
      await updateNextAppointment(patientId, appointmentDate);
      // Reload patients to get updated data
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating appointment');
      throw err;
    }
  }, [loadPatients]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.uid) {
      setPatients([]);
      return;
    }

    const unsubscribe = subscribeToPatients(user.uid, (patientsData) => {
      setPatients(patientsData);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  // Get patients by risk level
  const getPatientsByRiskLevel = useCallback((riskLevel: 'low' | 'medium' | 'high') => {
    return patients.filter(patient => patient.riskLevel === riskLevel);
  }, [patients]);

  // Get patients needing attention (high risk or no recent mood logs)
  const getPatientsNeedingAttention = useCallback(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    return patients.filter(patient => 
      patient.riskLevel === 'high' || 
      (patient.lastMoodDate && patient.lastMoodDate < threeDaysAgo)
    );
  }, [patients]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.isActive).length;
    const highRiskPatients = patients.filter(p => p.riskLevel === 'high').length;
    const averageMood = patients.length > 0 
      ? patients.reduce((sum, p) => sum + p.averageMood, 0) / patients.length 
      : 0;
    
    return {
      totalPatients,
      activePatients,
      highRiskPatients,
      averageMood: Math.round(averageMood * 10) / 10,
    };
  }, [patients]);

  return {
    patients,
    loading,
    error,
    loadPatients,
    updateNotes,
    updateAppointment,
    getPatientsByRiskLevel,
    getPatientsNeedingAttention,
    getStatistics,
    refreshPatients: loadPatients,
  };
};
