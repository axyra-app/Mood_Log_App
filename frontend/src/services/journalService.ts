import {
  Timestamp,
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
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';
import { requestAi } from './aiApi';
import { db } from './firebase';

// Journal Entry Service
export const createJournalEntry = async (
  entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> => {
  try {
    const journalRef = collection(db, 'journalEntries');
    
    // Clean data to remove undefined values
    const cleanData: Record<string, any> = {
      userId: entryData.userId,
      title: entryData.title,
      content: entryData.content,
      date: entryData.date,
      tags: entryData.tags || [],
      mood: entryData.mood || null,
      energy: entryData.energy || null,
      stress: entryData.stress || null,
      sleep: entryData.sleep || null,
      activities: entryData.activities || [],
      emotions: entryData.emotions || [],
      aiSuggestions: entryData.aiSuggestions || [],
      aiAnalysis: entryData.aiAnalysis || null,
      isPrivate: entryData.isPrivate || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Remove null values to avoid Firebase errors
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    const docRef = await addDoc(journalRef, cleanData);

    const newEntry: JournalEntry = {
      id: docRef.id,
      ...entryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newEntry;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>): Promise<void> => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    
    // Clean data to remove undefined values
    const cleanUpdates: Record<string, any> = { ...updates };
    
    // Remove undefined values to avoid Firebase errors
    Object.keys(cleanUpdates).forEach(key => {
      if (cleanUpdates[key] === undefined) {
        delete cleanUpdates[key];
      }
    });
    
    await updateDoc(entryRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

export const getJournalEntries = async (userId: string, limitCount: number = 10): Promise<JournalEntry[]> => {
  try {
    const journalRef = collection(db, 'journalEntries');
    // Consulta simplificada sin orderBy para evitar índices compuestos
    const q = query(journalRef, where('userId', '==', userId), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        date: data.date?.toDate() || new Date(),
        tags: data.tags || [],
        mood: data.mood,
        energy: data.energy,
        stress: data.stress,
        sleep: data.sleep,
        activities: data.activities || [],
        emotions: data.emotions || [],
        aiSuggestions: data.aiSuggestions || [],
        aiAnalysis: data.aiAnalysis,
        isPrivate: data.isPrivate || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // Ordenar en memoria por fecha descendente
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    return entries;
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

export const getJournalEntriesByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<JournalEntry[]> => {
  try {
    const journalRef = collection(db, 'journalEntries');
    const journalQuery = query(
      journalRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc'),
    );
    const snapshot = await getDocs(journalQuery);

    return snapshot.docs
      .map((journalDoc) => {
        const data = journalDoc.data();
        return {
          id: journalDoc.id,
          userId: data.userId,
          title: data.title,
          content: data.content,
          date: data.date?.toDate() || data.createdAt?.toDate() || new Date(0),
          tags: data.tags || [],
          mood: data.mood,
          energy: data.energy,
          stress: data.stress,
          sleep: data.sleep,
          activities: data.activities || [],
          emotions: data.emotions || [],
          aiSuggestions: data.aiSuggestions || [],
          aiAnalysis: data.aiAnalysis,
          isPrivate: data.isPrivate || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
  } catch (error) {
    console.error('Error getting journal entries for the requested period:', error);
    throw error;
  }
};

export const getJournalEntryById = async (entryId: string): Promise<JournalEntry | null> => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    const docSnap = await getDoc(entryRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        date: data.date?.toDate() || new Date(),
        tags: data.tags || [],
        mood: data.mood,
        energy: data.energy,
        stress: data.stress,
        sleep: data.sleep,
        activities: data.activities || [],
        emotions: data.emotions || [],
        aiSuggestions: data.aiSuggestions || [],
        aiAnalysis: data.aiAnalysis,
        isPrivate: data.isPrivate || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
};

// Journal Templates Service
export const getJournalTemplates = async (): Promise<JournalTemplate[]> => {
  try {
    const templatesRef = collection(db, 'journalTemplates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const templates: JournalTemplate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        content: data.content,
        tags: data.tags || [],
        category: data.category,
        isDefault: data.isDefault || false,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return templates.length ? templates : getDefaultTemplates();
  } catch (error) {
    console.error('Error getting journal templates:', error);
    throw error;
  }
};

// Journal Prompts Service
export const getJournalPrompts = async (category?: string): Promise<JournalPrompt[]> => {
  try {
    const promptsRef = collection(db, 'journalPrompts');
    let q = query(promptsRef, orderBy('createdAt', 'desc'));

    if (category) {
      q = query(promptsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const prompts: JournalPrompt[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prompts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        category: data.category,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        tags: data.tags || [],
      });
    });

    const availablePrompts = prompts.length ? prompts : getDefaultPrompts();
    return category
      ? availablePrompts.filter((prompt) => prompt.category === category)
      : availablePrompts;
  } catch (error) {
    console.error('Error getting journal prompts:', error);
    throw error;
  }
};

// AI Analysis Service for Journal Entries
export const analyzeJournalEntry = async (
  content: string
): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  themes: string[];
  insights: string[];
  recommendations: string[];
  summary: string;
}> => requestAi({
  task: 'journal-analysis',
  content,
});

// Default Journal Templates
export const getDefaultTemplates = (): JournalTemplate[] => [
  {
    id: 'daily-template',
    title: 'Diario Diario',
    description: 'Reflexiona sobre tu día',
    content: `# Mi día de hoy

## ¿Cómo me siento hoy?
[Escribe sobre tu estado emocional general]

## Lo mejor del día
[Describe algo positivo que te haya pasado]

## Desafíos del día
[Comparte cualquier dificultad que hayas enfrentado]

## Lo que aprendí
[Reflexiona sobre lecciones o aprendizajes]

## Gratitud
[Escribe 3 cosas por las que estás agradecido/a]

## Mañana me enfocaré en...
[Establece una intención para el día siguiente]`,
    tags: ['diario', 'reflexión', 'gratitud'],
    category: 'daily',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'gratitude-template',
    title: 'Diario de Gratitud',
    description: 'Practica la gratitud diaria',
    content: `# Diario de Gratitud

## 3 cosas por las que estoy agradecido/a hoy:

1. 
2. 
3. 

## Una persona que me hizo sentir especial:
[Describe cómo alguien impactó tu día positivamente]

## Un momento de alegría:
[Recuerda un momento que te hizo sonreír]

## Algo que me sorprendió positivamente:
[Comparte algo inesperado y bueno que te haya pasado]`,
    tags: ['gratitud', 'positividad', 'reflexión'],
    category: 'gratitude',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'weekly-template',
    title: 'Reflexión Semanal',
    description: 'Revisa tu semana',
    content: `# Reflexión Semanal

## Resumen de la semana
[Describe brevemente cómo fue tu semana]

## Logros de la semana
[Enumera tus logros y éxitos]

## Desafíos superados
[Comparte cómo enfrentaste las dificultades]

## Lecciones aprendidas
[¿Qué aprendiste esta semana?]

## Áreas de mejora
[¿Qué te gustaría mejorar la próxima semana?]

## Metas para la próxima semana
[Establece objetivos específicos]`,
    tags: ['semanal', 'reflexión', 'metas'],
    category: 'weekly',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'mood-template',
    title: 'Análisis de Estado de Ánimo',
    description: 'Profundiza en tus emociones',
    content: `# Análisis de Estado de Ánimo

## Estado emocional actual
[Describe cómo te sientes en este momento]

## Factores que influyen en mi estado de ánimo
[¿Qué situaciones, personas o eventos están afectando cómo te sientes?]

## Emociones que estoy experimentando
[Enumera las emociones principales que sientes]

## ¿Qué necesito ahora?
[Reflexiona sobre lo que necesitas para sentirte mejor]

## Estrategias de autocuidado
[¿Qué puedes hacer para cuidar tu bienestar emocional?]

## Mensaje para mí mismo/a
[Escribe algo que te gustaría recordar]`,
    tags: ['emociones', 'autocuidado', 'bienestar'],
    category: 'mood',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'stress-template',
    title: 'Manejo del Estrés',
    description: 'Identifica y gestiona el estrés',
    content: `# Manejo del Estrés

## Fuentes de estrés actuales
[Identifica qué te está causando estrés]

## Nivel de estrés (1-10)
[Evalúa tu nivel de estrés actual]

## Síntomas físicos
[¿Cómo se manifiesta el estrés en tu cuerpo?]

## Síntomas emocionales
[¿Qué emociones estás experimentando?]

## Estrategias de afrontamiento
[¿Qué puedes hacer para manejar el estrés?]

## Recursos de apoyo
[¿A quién puedes acudir por ayuda?]

## Plan de acción
[Establece pasos específicos para reducir el estrés]`,
    tags: ['estrés', 'bienestar', 'autocuidado'],
    category: 'stress',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'goals-template',
    title: 'Metas y Objetivos',
    description: 'Planifica y revisa tus metas',
    content: `# Metas y Objetivos

## Metas a corto plazo (1-3 meses)
[Establece objetivos alcanzables en el corto plazo]

## Metas a largo plazo (6-12 meses)
[Define tus aspiraciones a futuro]

## Progreso actual
[¿Cómo vas con tus metas actuales?]

## Obstáculos identificados
[¿Qué dificultades estás enfrentando?]

## Recursos necesarios
[¿Qué necesitas para alcanzar tus metas?]

## Plan de acción
[Establece pasos específicos para cada meta]

## Celebración de logros
[¿Qué has logrado recientemente?]`,
    tags: ['metas', 'objetivos', 'planificación'],
    category: 'goals',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
  {
    id: 'relationships-template',
    title: 'Relaciones Interpersonales',
    description: 'Reflexiona sobre tus relaciones',
    content: `# Relaciones Interpersonales

## Relaciones importantes en mi vida
[Identifica las personas más significativas]

## Cómo me siento en mis relaciones
[Reflexiona sobre la calidad de tus conexiones]

## Comunicación
[¿Cómo te comunicas con los demás?]

## Conflictos o tensiones
[¿Hay alguna relación que necesite atención?]

## Apoyo que recibo
[¿De quién recibes apoyo emocional?]

## Apoyo que ofrezco
[¿Cómo apoyas a otros?]

## Mejoras en las relaciones
[¿Qué puedes hacer para fortalecer tus relaciones?]`,
    tags: ['relaciones', 'comunicación', 'apoyo'],
    category: 'relationships',
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
  },
];

// Default Journal Prompts
export const getDefaultPrompts = (): JournalPrompt[] => [
  {
    id: 'daily-prompt-1',
    title: '¿Cómo te sientes hoy?',
    content:
      'Describe tu estado emocional actual. ¿Qué emociones estás experimentando? ¿Hay algo específico que esté influyendo en cómo te sientes?',
    category: 'daily',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['emociones', 'estado de ánimo'],
  },
  {
    id: 'reflection-prompt-1',
    title: 'Un momento significativo',
    content:
      'Piensa en un momento de hoy que haya sido especialmente significativo para ti. ¿Por qué fue importante? ¿Cómo te hizo sentir?',
    category: 'reflection',
    difficulty: 'medium',
    estimatedTime: 10,
    tags: ['reflexión', 'significado'],
  },
  {
    id: 'gratitude-prompt-1',
    title: 'Gratitud por las pequeñas cosas',
    content:
      'A veces las cosas más pequeñas pueden traernos la mayor alegría. ¿Qué pequeña cosa te trajo felicidad hoy?',
    category: 'gratitude',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['gratitud', 'felicidad'],
  },
  {
    id: 'goal-prompt-1',
    title: 'Progreso hacia mis metas',
    content:
      'Reflexiona sobre tus metas personales. ¿Qué progreso has hecho hacia ellas? ¿Qué pasos puedes dar mañana?',
    category: 'goal-setting',
    difficulty: 'medium',
    estimatedTime: 10,
    tags: ['metas', 'progreso'],
  },
  {
    id: 'emotional-prompt-1',
    title: 'Navegando emociones difíciles',
    content:
      'Si estás experimentando emociones difíciles hoy, escribe sobre ellas. ¿Qué las está causando? ¿Cómo puedes cuidarte mejor?',
    category: 'emotional',
    difficulty: 'hard',
    estimatedTime: 15,
    tags: ['emociones', 'autocuidado'],
  },
];
