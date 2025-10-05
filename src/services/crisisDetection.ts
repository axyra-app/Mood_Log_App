import { addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface CrisisSignal {
  id: string;
  userId: string;
  signalType: 'mood' | 'behavioral' | 'social' | 'physical' | 'verbal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  psychologistId?: string;
  interventionRequired: boolean;
  metadata: {
    moodScore?: number;
    stressLevel?: number;
    sleepQuality?: number;
    energyLevel?: number;
    emotions?: string[];
    activities?: string[];
    notes?: string;
  };
}

export interface CrisisAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  signals: CrisisSignal[];
  recommendations: string[];
  immediateActions: string[];
  followUpRequired: boolean;
  psychologistNotification: boolean;
  emergencyContact: boolean;
  assessmentScore: number;
  confidence: number;
}

// Patrones de crisis específicos
const CRISIS_PATTERNS = {
  SUICIDAL_IDEATION: {
    keywords: ['suicidio', 'morir', 'acabar', 'desaparecer', 'no vale la pena', 'sin esperanza'],
    emotions: ['desesperanza', 'desesperación', 'vacío', 'nada'],
    behaviors: ['aislamiento', 'despedirse', 'regalar pertenencias'],
    severity: 'critical' as const,
  },
  SELF_HARM: {
    keywords: ['cortar', 'herir', 'dañar', 'autolesión'],
    emotions: ['culpa', 'vergüenza', 'ira', 'frustración'],
    behaviors: ['ocultar heridas', 'usar mangas largas'],
    severity: 'high' as const,
  },
  PANIC_ATTACK: {
    keywords: ['pánico', 'ataque', 'no puedo respirar', 'me muero'],
    emotions: ['miedo', 'terror', 'ansiedad extrema'],
    behaviors: ['hiperventilación', 'taquicardia'],
    severity: 'high' as const,
  },
  DEPRESSION_SPIRAL: {
    keywords: ['deprimido', 'triste', 'vacío', 'sin energía'],
    emotions: ['tristeza', 'desesperanza', 'apatía'],
    behaviors: ['aislamiento', 'falta de higiene', 'no comer'],
    severity: 'medium' as const,
  },
  SUBSTANCE_ABUSE: {
    keywords: ['beber', 'drogas', 'pastillas', 'escapar'],
    emotions: ['culpa', 'vergüenza', 'ansiedad'],
    behaviors: ['consumo excesivo', 'ocultar consumo'],
    severity: 'high' as const,
  },
};

// Función principal de detección de crisis
export const detectCrisisSignals = async (
  userId: string,
  moodData: {
    mood: number;
    energy: number;
    stress: number;
    sleep: number;
    notes: string;
    activities: string[];
    emotions: string[];
  },
  recentHistory?: any[]
): Promise<CrisisAssessment> => {
  try {
    const signals: CrisisSignal[] = [];
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let assessmentScore = 0;

    // 1. Análisis de estado de ánimo
    const moodSignal = analyzeMoodCrisis(moodData);
    if (moodSignal) {
      signals.push(moodSignal);
      assessmentScore += getSeverityScore(moodSignal.severity);
    }

    // 2. Análisis de patrones de comportamiento
    const behavioralSignals = analyzeBehavioralPatterns(moodData, recentHistory);
    signals.push(...behavioralSignals);
    behavioralSignals.forEach((signal) => {
      assessmentScore += getSeverityScore(signal.severity);
    });

    // 3. Análisis de contenido textual
    const textSignals = analyzeTextContent(moodData.notes);
    signals.push(...textSignals);
    textSignals.forEach((signal) => {
      assessmentScore += getSeverityScore(signal.severity);
    });

    // 4. Análisis de patrones sociales
    const socialSignals = analyzeSocialPatterns(moodData, recentHistory);
    signals.push(...socialSignals);
    socialSignals.forEach((signal) => {
      assessmentScore += getSeverityScore(signal.severity);
    });

    // 5. Análisis de patrones físicos
    const physicalSignals = analyzePhysicalPatterns(moodData, recentHistory);
    signals.push(...physicalSignals);
    physicalSignals.forEach((signal) => {
      assessmentScore += getSeverityScore(signal.severity);
    });

    // Determinar riesgo general
    overallRisk = determineOverallRisk(assessmentScore, signals);

    // Generar recomendaciones
    const recommendations = generateRecommendations(overallRisk, signals);
    const immediateActions = generateImmediateActions(overallRisk, signals);

    // Determinar si se requiere notificación
    const psychologistNotification = overallRisk === 'high' || overallRisk === 'critical';
    const emergencyContact = overallRisk === 'critical';
    const followUpRequired = overallRisk !== 'low';

    // Calcular confianza
    const confidence = calculateConfidence(signals, recentHistory);

    const assessment: CrisisAssessment = {
      overallRisk,
      signals,
      recommendations,
      immediateActions,
      followUpRequired,
      psychologistNotification,
      emergencyContact,
      assessmentScore,
      confidence,
    };

    // Guardar evaluación en Firestore
    await saveCrisisAssessment(userId, assessment);

    return assessment;
  } catch (error) {
    console.error('Error en detección de crisis:', error);
    throw error;
  }
};

// Análisis específico de estado de ánimo
function analyzeMoodCrisis(moodData: any): CrisisSignal | null {
  const { mood, energy, stress, sleep } = moodData;

  // Crisis por estado de ánimo extremadamente bajo
  if (mood <= 1 && energy <= 2 && sleep <= 2) {
    return {
      id: `mood-crisis-${Date.now()}`,
      userId: '',
      signalType: 'mood',
      severity: 'critical',
      description: 'Estado de ánimo extremadamente bajo combinado con falta de energía y sueño',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {
        moodScore: mood,
        energyLevel: energy,
        sleepQuality: sleep,
      },
    };
  }

  // Crisis por estrés extremo
  if (stress >= 9 && sleep <= 3) {
    return {
      id: `stress-crisis-${Date.now()}`,
      userId: '',
      signalType: 'mood',
      severity: 'high',
      description: 'Niveles de estrés extremos combinados con problemas de sueño',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {
        stressLevel: stress,
        sleepQuality: sleep,
      },
    };
  }

  return null;
}

// Análisis de patrones de comportamiento
function analyzeBehavioralPatterns(moodData: any, recentHistory?: any[]): CrisisSignal[] {
  const signals: CrisisSignal[] = [];

  if (!recentHistory || recentHistory.length < 3) return signals;

  // Patrón de deterioro progresivo
  const recentMoods = recentHistory.slice(0, 7).map((log) => log.mood);
  const isDeclining = recentMoods.every((mood, index) => index === 0 || mood <= recentMoods[index - 1]);

  if (isDeclining && recentMoods[0] <= 2) {
    signals.push({
      id: `behavioral-decline-${Date.now()}`,
      userId: '',
      signalType: 'behavioral',
      severity: 'medium',
      description: 'Patrón de deterioro progresivo del estado de ánimo',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {
        moodScore: recentMoods[0],
      },
    });
  }

  // Patrón de aislamiento social
  const hasSocialActivities = recentHistory.some((log) =>
    log.activities.some((activity: string) =>
      ['social', 'amigos', 'familia', 'comunidad'].includes(activity.toLowerCase())
    )
  );

  if (!hasSocialActivities && moodData.mood <= 2) {
    signals.push({
      id: `social-isolation-${Date.now()}`,
      userId: '',
      signalType: 'social',
      severity: 'medium',
      description: 'Aislamiento social combinado con bajo estado de ánimo',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {
        moodScore: moodData.mood,
      },
    });
  }

  return signals;
}

// Análisis de contenido textual
function analyzeTextContent(notes: string): CrisisSignal[] {
  const signals: CrisisSignal[] = [];

  if (!notes || notes.length < 10) return signals;

  const text = notes.toLowerCase();

  // Detectar ideación suicida
  Object.entries(CRISIS_PATTERNS).forEach(([pattern, config]) => {
    const hasKeywords = config.keywords.some((keyword) => text.includes(keyword));

    if (hasKeywords) {
      signals.push({
        id: `${pattern.toLowerCase()}-${Date.now()}`,
        userId: '',
        signalType: 'verbal',
        severity: config.severity,
        description: `Detectado patrón de ${pattern.toLowerCase()} en notas del usuario`,
        detectedAt: new Date(),
        resolved: false,
        interventionRequired: true,
        metadata: {
          notes: notes,
        },
      });
    }
  });

  return signals;
}

// Análisis de patrones sociales
function analyzeSocialPatterns(moodData: any, recentHistory?: any[]): CrisisSignal[] {
  const signals: CrisisSignal[] = [];

  if (!recentHistory) return signals;

  // Detectar pérdida de conexión social
  const socialActivities = recentHistory.filter((log) =>
    log.activities.some((activity: string) =>
      ['social', 'amigos', 'familia', 'comunidad'].includes(activity.toLowerCase())
    )
  );

  if (socialActivities.length === 0 && recentHistory.length >= 5) {
    signals.push({
      id: `social-disconnection-${Date.now()}`,
      userId: '',
      signalType: 'social',
      severity: 'medium',
      description: 'Pérdida completa de actividades sociales',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {},
    });
  }

  return signals;
}

// Análisis de patrones físicos
function analyzePhysicalPatterns(moodData: any, recentHistory?: any[]): CrisisSignal[] {
  const signals: CrisisSignal[] = [];

  // Patrón de sueño deteriorado
  if (moodData.sleep <= 2 && moodData.energy <= 3) {
    signals.push({
      id: `sleep-crisis-${Date.now()}`,
      userId: '',
      signalType: 'physical',
      severity: 'medium',
      description: 'Deterioro severo del sueño combinado con falta de energía',
      detectedAt: new Date(),
      resolved: false,
      interventionRequired: true,
      metadata: {
        sleepQuality: moodData.sleep,
        energyLevel: moodData.energy,
      },
    });
  }

  return signals;
}

// Determinar riesgo general
function determineOverallRisk(score: number, signals: CrisisSignal[]): 'low' | 'medium' | 'high' | 'critical' {
  const criticalSignals = signals.filter((s) => s.severity === 'critical').length;
  const highSignals = signals.filter((s) => s.severity === 'high').length;

  if (criticalSignals > 0 || score >= 20) return 'critical';
  if (highSignals > 0 || score >= 15) return 'high';
  if (score >= 8) return 'medium';
  return 'low';
}

// Generar recomendaciones
function generateRecommendations(risk: string, signals: CrisisSignal[]): string[] {
  const recommendations: string[] = [];

  switch (risk) {
    case 'critical':
      recommendations.push('🚨 BUSCA AYUDA PROFESIONAL INMEDIATAMENTE');
      recommendations.push('Contacta a un profesional de salud mental o línea de crisis');
      recommendations.push('No estás solo - hay personas que pueden ayudarte');
      recommendations.push('Considera contactar a un familiar o amigo de confianza');
      break;
    case 'high':
      recommendations.push('Considera hablar con un profesional de salud mental');
      recommendations.push('Mantén contacto regular con tu red de apoyo');
      recommendations.push('Implementa estrategias de autocuidado diarias');
      recommendations.push('Considera terapia o counseling');
      break;
    case 'medium':
      recommendations.push('Monitorea tu bienestar regularmente');
      recommendations.push('Mantén las prácticas que te están funcionando');
      recommendations.push('Considera técnicas de relajación');
      recommendations.push('Mantén rutinas saludables');
      break;
    default:
      recommendations.push('Continúa monitoreando tu bienestar');
      recommendations.push('Mantén las prácticas positivas');
  }

  return recommendations;
}

// Generar acciones inmediatas
function generateImmediateActions(risk: string, signals: CrisisSignal[]): string[] {
  const actions: string[] = [];

  switch (risk) {
    case 'critical':
      actions.push('Contactar línea de crisis: 911 o línea nacional de prevención del suicidio');
      actions.push('Buscar ayuda médica inmediata');
      actions.push('Contactar a un familiar o amigo de confianza');
      actions.push('Eliminar acceso a medios de autolesión');
      break;
    case 'high':
      actions.push('Programar cita con profesional de salud mental');
      actions.push('Contactar a tu red de apoyo');
      actions.push('Implementar técnicas de crisis');
      actions.push('Monitorear síntomas regularmente');
      break;
    case 'medium':
      actions.push('Revisar estrategias de afrontamiento');
      actions.push('Mantener rutinas saludables');
      actions.push('Practicar técnicas de relajación');
      break;
  }

  return actions;
}

// Calcular confianza del análisis
function calculateConfidence(signals: CrisisSignal[], history?: any[]): number {
  let confidence = 0;

  // Más señales = mayor confianza
  confidence += Math.min(signals.length * 10, 40);

  // Historial disponible = mayor confianza
  if (history && history.length >= 5) {
    confidence += 20;
  }

  // Señales críticas = mayor confianza
  const criticalSignals = signals.filter((s) => s.severity === 'critical').length;
  confidence += criticalSignals * 15;

  return Math.min(confidence, 100);
}

// Obtener puntuación de severidad
function getSeverityScore(severity: string): number {
  switch (severity) {
    case 'critical':
      return 10;
    case 'high':
      return 7;
    case 'medium':
      return 4;
    case 'low':
      return 1;
    default:
      return 0;
  }
}

// Guardar evaluación de crisis
async function saveCrisisAssessment(userId: string, assessment: CrisisAssessment): Promise<void> {
  try {
    await addDoc(collection(db, 'crisisAssessments'), {
      userId,
      ...assessment,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error guardando evaluación de crisis:', error);
    throw error;
  }
}

// Obtener evaluaciones de crisis recientes
export const getRecentCrisisAssessments = async (userId: string, limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, 'crisisAssessments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo evaluaciones de crisis:', error);
    throw error;
  }
};

// Notificar a psicólogos sobre crisis
export const notifyPsychologistOfCrisis = async (
  userId: string,
  assessment: CrisisAssessment,
  psychologistId: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'crisisAlerts'), {
      userId,
      psychologistId,
      assessment,
      urgency: assessment.overallRisk,
      createdAt: new Date(),
      resolved: false,
      notificationSent: true,
    });
  } catch (error) {
    console.error('Error notificando psicólogo sobre crisis:', error);
    throw error;
  }
};

