import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { MedicalReport, PatientHistory } from '../types';
import { db } from './firebase';

// Medical Report Service
export const createMedicalReport = async (
  reportData: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MedicalReport> => {
  try {
    const reportsRef = collection(db, 'medicalReports');
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newReport: MedicalReport = {
      id: docRef.id,
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newReport;
  } catch (error) {
    console.error('Error creating medical report:', error);
    throw error;
  }
};

export const updateMedicalReport = async (reportId: string, updates: Partial<MedicalReport>): Promise<void> => {
  try {
    const reportRef = doc(db, 'medicalReports', reportId);
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating medical report:', error);
    throw error;
  }
};

export const deleteMedicalReport = async (reportId: string): Promise<void> => {
  try {
    const reportRef = doc(db, 'medicalReports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting medical report:', error);
    throw error;
  }
};

export const getMedicalReports = async (psychologistId: string, patientId?: string): Promise<MedicalReport[]> => {
  try {
    const reportsRef = collection(db, 'medicalReports');
    let q = query(reportsRef, where('psychologistId', '==', psychologistId), orderBy('createdAt', 'desc'));

    if (patientId) {
      q = query(
        reportsRef,
        where('psychologistId', '==', psychologistId),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const reports: MedicalReport[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        patientId: data.patientId,
        psychologistId: data.psychologistId,
        reportType: data.reportType,
        title: data.title,
        content: data.content,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        recommendations: data.recommendations || [],
        medications: data.medications || [],
        nextAppointment: data.nextAppointment?.toDate(),
        riskAssessment: data.riskAssessment,
        attachments: data.attachments || [],
        isConfidential: data.isConfidential || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return reports;
  } catch (error) {
    console.error('Error getting medical reports:', error);
    throw error;
  }
};

export const getMedicalReportById = async (reportId: string): Promise<MedicalReport | null> => {
  try {
    const reportRef = doc(db, 'medicalReports', reportId);
    const docSnap = await getDoc(reportRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        patientId: data.patientId,
        psychologistId: data.psychologistId,
        reportType: data.reportType,
        title: data.title,
        content: data.content,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        recommendations: data.recommendations || [],
        medications: data.medications || [],
        nextAppointment: data.nextAppointment?.toDate(),
        riskAssessment: data.riskAssessment,
        attachments: data.attachments || [],
        isConfidential: data.isConfidential || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting medical report:', error);
    throw error;
  }
};

// Patient History Service
export const createPatientHistory = async (
  historyData: Omit<PatientHistory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PatientHistory> => {
  try {
    const historyRef = collection(db, 'patientHistory');
    const docRef = await addDoc(historyRef, {
      ...historyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newHistory: PatientHistory = {
      id: docRef.id,
      ...historyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newHistory;
  } catch (error) {
    console.error('Error creating patient history:', error);
    throw error;
  }
};

export const updatePatientHistory = async (historyId: string, updates: Partial<PatientHistory>): Promise<void> => {
  try {
    const historyRef = doc(db, 'patientHistory', historyId);
    await updateDoc(historyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating patient history:', error);
    throw error;
  }
};

export const getPatientHistory = async (patientId: string, psychologistId: string): Promise<PatientHistory | null> => {
  try {
    const historyRef = collection(db, 'patientHistory');
    const q = query(
      historyRef,
      where('patientId', '==', patientId),
      where('psychologistId', '==', psychologistId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId,
        psychologistId: data.psychologistId,
        medicalHistory: data.medicalHistory || {
          mentalHealth: [],
          physicalHealth: [],
          medications: [],
          allergies: [],
          familyHistory: [],
        },
        psychologicalHistory: data.psychologicalHistory || {
          previousTherapy: [],
          diagnoses: [],
          treatments: [],
          hospitalizations: [],
        },
        socialHistory: data.socialHistory || {
          education: '',
          occupation: '',
          relationships: '',
          livingSituation: '',
          substanceUse: [],
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting patient history:', error);
    throw error;
  }
};

// Report Templates
export const getReportTemplates = () => [
  {
    id: 'initial-assessment',
    title: 'Evaluación Inicial',
    content: `# Evaluación Inicial

## Información del Paciente
- **Nombre:** [Nombre del paciente]
- **Edad:** [Edad]
- **Fecha de evaluación:** [Fecha]

## Motivo de Consulta
[Descripción del motivo principal de consulta]

## Historia Clínica
### Antecedentes Médicos
- Enfermedades físicas: [Lista]
- Medicamentos actuales: [Lista]
- Alergias: [Lista]

### Antecedentes Psicológicos
- Terapias previas: [Lista]
- Diagnósticos previos: [Lista]
- Hospitalizaciones psiquiátricas: [Lista]

### Antecedentes Familiares
- Historia familiar de salud mental: [Descripción]

## Evaluación Psicológica
### Estado Mental Actual
- Apariencia: [Descripción]
- Comportamiento: [Descripción]
- Estado de ánimo: [Descripción]
- Afecto: [Descripción]
- Pensamiento: [Descripción]
- Percepción: [Descripción]
- Cognición: [Descripción]

### Evaluación de Riesgo
- Riesgo de suicidio: [Bajo/Medio/Alto]
- Riesgo de autolesión: [Bajo/Medio/Alto]
- Riesgo de violencia: [Bajo/Medio/Alto]

## Diagnóstico Provisional
[Diagnóstico provisional según DSM-5]

## Plan de Tratamiento
### Objetivos Terapéuticos
1. [Objetivo 1]
2. [Objetivo 2]
3. [Objetivo 3]

### Intervenciones Propuestas
- [Intervención 1]
- [Intervención 2]
- [Intervención 3]

### Recomendaciones
- [Recomendación 1]
- [Recomendación 2]
- [Recomendación 3]

## Próxima Cita
- **Fecha:** [Fecha]
- **Objetivo:** [Objetivo de la próxima sesión]`,
    reportType: 'initial' as const,
  },
  {
    id: 'progress-report',
    title: 'Informe de Progreso',
    content: `# Informe de Progreso

## Información del Paciente
- **Nombre:** [Nombre del paciente]
- **Período evaluado:** [Fecha inicio] - [Fecha fin]

## Resumen de Sesiones
### Sesiones Realizadas
- Total de sesiones: [Número]
- Frecuencia: [Semanal/Mensual/etc.]

### Temas Trabajados
- [Tema 1]
- [Tema 2]
- [Tema 3]

## Progreso Observado
### Áreas de Mejora
- [Área 1]: [Descripción del progreso]
- [Área 2]: [Descripción del progreso]
- [Área 3]: [Descripción del progreso]

### Áreas que Requieren Atención
- [Área 1]: [Descripción]
- [Área 2]: [Descripción]

## Evaluación de Objetivos
### Objetivos Alcanzados
- [Objetivo 1]: [Estado]
- [Objetivo 2]: [Estado]

### Objetivos en Progreso
- [Objetivo 1]: [Progreso]
- [Objetivo 2]: [Progreso]

## Modificaciones al Plan de Tratamiento
- [Modificación 1]
- [Modificación 2]

## Recomendaciones
- [Recomendación 1]
- [Recomendación 2]

## Próximos Pasos
- [Paso 1]
- [Paso 2]`,
    reportType: 'progress' as const,
  },
  {
    id: 'discharge-report',
    title: 'Informe de Alta',
    content: `# Informe de Alta

## Información del Paciente
- **Nombre:** [Nombre del paciente]
- **Fecha de alta:** [Fecha]
- **Duración del tratamiento:** [Período]

## Resumen del Tratamiento
### Objetivos Iniciales
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

### Objetivos Alcanzados
- [Objetivo 1]: [Estado]
- [Objetivo 2]: [Estado]
- [Objetivo 3]: [Estado]

## Progreso General
[Descripción del progreso general del paciente]

## Diagnóstico Final
[Diagnóstico final según DSM-5]

## Recomendaciones Post-Alta
### Seguimiento
- [Recomendación de seguimiento]

### Recursos Adicionales
- [Recurso 1]
- [Recurso 2]

### Señales de Alerta
- [Señal 1]
- [Señal 2]

## Contacto de Emergencia
- **Teléfono:** [Número]
- **Disponibilidad:** [Horarios]`,
    reportType: 'discharge' as const,
  },
];
