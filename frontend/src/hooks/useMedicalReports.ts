import { useCallback, useEffect, useState } from 'react';
import {
  createMedicalReport,
  createPatientHistory,
  deleteMedicalReport,
  getMedicalReportById,
  getMedicalReports,
  getPatientHistory,
  getReportTemplates,
  updateMedicalReport,
  updatePatientHistory,
} from '../services/medicalReportService';
import { MedicalReport, PatientHistory } from '../types';

export const useMedicalReports = (psychologistId: string) => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [templates, setTemplates] = useState(getReportTemplates());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load medical reports
  const loadReports = useCallback(
    async (patientId?: string) => {
      if (!psychologistId) return;

      try {
        setLoading(true);
        setError(null);
        const medicalReports = await getMedicalReports(psychologistId, patientId);
        setReports(medicalReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading medical reports');
      } finally {
        setLoading(false);
      }
    },
    [psychologistId]
  );

  // Create new medical report
  const createReport = useCallback(async (reportData: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newReport = await createMedicalReport(reportData);
      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating medical report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update medical report
  const updateReport = useCallback(async (reportId: string, updates: Partial<MedicalReport>) => {
    try {
      setLoading(true);
      setError(null);
      await updateMedicalReport(reportId, updates);
      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, ...updates, updatedAt: new Date() } : report))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating medical report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete medical report
  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteMedicalReport(reportId);
      setReports((prev) => prev.filter((report) => report.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting medical report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get medical report by ID
  const getReport = useCallback(async (reportId: string): Promise<MedicalReport | null> => {
    try {
      setLoading(true);
      setError(null);
      return await getMedicalReportById(reportId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting medical report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get reports by patient
  const getReportsByPatient = useCallback(
    (patientId: string) => {
      return reports.filter((report) => report.patientId === patientId);
    },
    [reports]
  );

  // Get reports by type
  const getReportsByType = useCallback(
    (reportType: 'initial' | 'progress' | 'discharge' | 'emergency') => {
      return reports.filter((report) => report.reportType === reportType);
    },
    [reports]
  );

  // Get high risk reports
  const getHighRiskReports = useCallback(() => {
    return reports.filter((report) => report.riskAssessment === 'high');
  }, [reports]);

  // Load data on mount
  useEffect(() => {
    if (psychologistId) {
      loadReports();
    }
  }, [psychologistId, loadReports]);

  return {
    // State
    reports,
    templates,
    loading,
    error,

    // Actions
    createReport,
    updateReport,
    deleteReport,
    getReport,
    loadReports,

    // Utilities
    getReportsByPatient,
    getReportsByType,
    getHighRiskReports,
  };
};

export const usePatientHistory = (patientId: string, psychologistId: string) => {
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patient history
  const loadHistory = useCallback(async () => {
    if (!patientId || !psychologistId) return;

    try {
      setLoading(true);
      setError(null);
      const patientHistory = await getPatientHistory(patientId, psychologistId);
      setHistory(patientHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading patient history');
    } finally {
      setLoading(false);
    }
  }, [patientId, psychologistId]);

  // Create patient history
  const createHistory = useCallback(async (historyData: Omit<PatientHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newHistory = await createPatientHistory(historyData);
      setHistory(newHistory);
      return newHistory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating patient history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update patient history
  const updateHistory = useCallback(
    async (updates: Partial<PatientHistory>) => {
      if (!history) return;

      try {
        setLoading(true);
        setError(null);
        await updatePatientHistory(history.id, updates);
        setHistory((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating patient history');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [history]
  );

  // Load data on mount
  useEffect(() => {
    if (patientId && psychologistId) {
      loadHistory();
    }
  }, [patientId, psychologistId, loadHistory]);

  return {
    // State
    history,
    loading,
    error,

    // Actions
    createHistory,
    updateHistory,
    loadHistory,
  };
};
