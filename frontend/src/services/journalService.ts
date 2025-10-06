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
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';
import { db } from './firebase';

// Journal Entry Service
export const createJournalEntry = async (
  entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> => {
  try {
    const journalRef = collection(db, 'journalEntries');
    const docRef = await addDoc(journalRef, {
      ...entryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

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
    await updateDoc(entryRef, {
      ...updates,
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
    const q = query(journalRef, where('userId', '==', userId), orderBy('date', 'desc'), limit(limitCount));

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

    return entries;
  } catch (error) {
    console.error('Error getting journal entries:', error);
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

    return templates;
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

    return prompts;
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
}> => {
  try {
    // Simulate AI analysis (replace with actual AI service)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    const words = content.toLowerCase().split(' ');
    const positiveWords = [
      'feliz',
      'alegre',
      'contento',
      'bueno',
      'excelente',
      'genial',
      'maravilloso',
      'increíble',
      'perfecto',
      'fantástico',
    ];
    const negativeWords = [
      'triste',
      'malo',
      'terrible',
      'horrible',
      'deprimido',
      'ansioso',
      'estresado',
      'preocupado',
      'molesto',
      'enojado',
    ];

    const positiveCount = words.filter((word) => positiveWords.includes(word)).length;
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }

    // Extract themes
    const themes = [];
    if (words.includes('trabajo') || words.includes('trabajar')) themes.push('Trabajo');
    if (words.includes('familia') || words.includes('familiares')) themes.push('Familia');
    if (words.includes('amigos') || words.includes('amistad')) themes.push('Amistades');
    if (words.includes('salud') || words.includes('ejercicio')) themes.push('Salud');
    if (words.includes('estudio') || words.includes('aprender')) themes.push('Educación');

    // Generate insights and recommendations based on content
    const insights = [];
    const recommendations = [];

    if (sentiment === 'positive') {
      insights.push('Tu estado de ánimo es positivo hoy');
      recommendations.push('Mantén las actividades que te hacen sentir bien');
    } else if (sentiment === 'negative') {
      insights.push('Parece que estás pasando por un momento difícil');
      recommendations.push('Considera hablar con alguien de confianza');
      recommendations.push('Practica técnicas de relajación');
    }

    if (themes.includes('Trabajo')) {
      insights.push('El trabajo es un tema importante en tu vida');
      recommendations.push('Busca equilibrio entre trabajo y vida personal');
    }

    return {
      sentiment,
      themes: themes.length > 0 ? themes : ['General'],
      insights: insights.length > 0 ? insights : ['Continúa reflexionando sobre tus experiencias'],
      recommendations: recommendations.length > 0 ? recommendations : ['Mantén el hábito de escribir en tu diario'],
    };
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    return {
      sentiment: 'neutral',
      themes: ['General'],
      insights: ['Análisis no disponible en este momento'],
      recommendations: ['Continúa escribiendo en tu diario'],
    };
  }
};

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
