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
import { initializeDefaultJournalData } from './journalDefaultData';

// Journal Entry Service
export const createJournalEntry = async (
  entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> => {
  try {
    const journalRef = collection(db, 'journalEntries');
    
    // Clean data to remove undefined values
    const cleanData = {
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
    const cleanUpdates = { ...updates };
    
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

    // Si no hay plantillas, inicializar datos por defecto
    if (templates.length === 0) {
      console.log('🔄 No hay plantillas, inicializando datos por defecto...');
      await initializeDefaultJournalData();
      // Recargar después de inicializar
      const newQuerySnapshot = await getDocs(q);
      newQuerySnapshot.forEach((doc) => {
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
    }

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

    // Si no hay prompts, inicializar datos por defecto
    if (prompts.length === 0) {
      console.log('🔄 No hay prompts, inicializando datos por defecto...');
      await initializeDefaultJournalData();
      // Recargar después de inicializar
      const newQuerySnapshot = await getDocs(q);
      newQuerySnapshot.forEach((doc) => {
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
    }

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
    
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const words = content.toLowerCase().split(/\s+/);
    const positiveWords = [
      'feliz', 'alegre', 'contento', 'bueno', 'excelente', 'genial', 'maravilloso', 'increíble', 'perfecto', 'fantástico',
      'amor', 'querer', 'querido', 'hermoso', 'bello', 'divertido', 'risa', 'sonreír', 'sonrisa', 'risa',
      'éxito', 'logro', 'conseguir', 'ganar', 'victoria', 'triunfo', 'superar', 'mejorar', 'progreso',
      'gratitud', 'agradecido', 'bendecido', 'afortunado', 'suerte', 'oportunidad', 'momento', 'experiencia',
      'paz', 'tranquilo', 'calma', 'relajado', 'satisfecho', 'pleno', 'completo', 'realizado'
    ];
    
    const negativeWords = [
      'triste', 'malo', 'terrible', 'horrible', 'deprimido', 'ansioso', 'estresado', 'preocupado', 'molesto', 'enojado',
      'miedo', 'temer', 'asustado', 'nervioso', 'angustiado', 'desesperado', 'perdido', 'confundido', 'solo', 'solitario',
      'fracaso', 'fallar', 'perder', 'derrota', 'problema', 'dificultad', 'obstáculo', 'barrera', 'lucha', 'pelea',
      'dolor', 'sufrimiento', 'pena', 'luto', 'duelo', 'separación', 'ruptura', 'abandono', 'rechazo', 'crítica'
    ];

    const positiveCount = words.filter((word) => positiveWords.some(pw => word.includes(pw))).length;
    const negativeCount = words.filter((word) => negativeWords.some(nw => word.includes(nw))).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount && positiveCount > 0) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      sentiment = 'negative';
    }

    // Extract themes based on content analysis
    const themes = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('trabajo') || contentLower.includes('trabajar') || contentLower.includes('oficina') || contentLower.includes('empleo')) {
      themes.push('Trabajo');
    }
    if (contentLower.includes('familia') || contentLower.includes('familiares') || contentLower.includes('padres') || contentLower.includes('hermanos')) {
      themes.push('Familia');
    }
    if (contentLower.includes('amigos') || contentLower.includes('amistad') || contentLower.includes('compañeros') || contentLower.includes('social')) {
      themes.push('Amistades');
    }
    if (contentLower.includes('salud') || contentLower.includes('ejercicio') || contentLower.includes('deporte') || contentLower.includes('médico')) {
      themes.push('Salud');
    }
    if (contentLower.includes('estudio') || contentLower.includes('aprender') || contentLower.includes('universidad') || contentLower.includes('escuela')) {
      themes.push('Educación');
    }
    if (contentLower.includes('amor') || contentLower.includes('pareja') || contentLower.includes('novio') || contentLower.includes('novia')) {
      themes.push('Relaciones');
    }
    if (contentLower.includes('viaje') || contentLower.includes('vacaciones') || contentLower.includes('aventura') || contentLower.includes('explorar')) {
      themes.push('Viajes');
    }
    if (contentLower.includes('hobby') || contentLower.includes('pasatiempo') || contentLower.includes('música') || contentLower.includes('arte')) {
      themes.push('Pasatiempos');
    }

    // Generate contextual insights and recommendations
    const insights = [];
    const recommendations = [];

    if (sentiment === 'positive') {
      insights.push('Tu estado de ánimo es positivo hoy');
      insights.push('Pareces estar experimentando emociones agradables');
      recommendations.push('Mantén las actividades que te hacen sentir bien');
      recommendations.push('Comparte tu positividad con otros');
    } else if (sentiment === 'negative') {
      insights.push('Parece que estás pasando por un momento difícil');
      insights.push('Es normal tener días complicados');
      recommendations.push('Considera hablar con alguien de confianza');
      recommendations.push('Practica técnicas de relajación o mindfulness');
      recommendations.push('Recuerda que los sentimientos negativos son temporales');
    } else {
      insights.push('Tu estado emocional parece equilibrado');
      insights.push('Estás reflexionando sobre diferentes aspectos de tu vida');
      recommendations.push('Continúa explorando tus pensamientos y emociones');
    }

    // Add theme-specific insights
    if (themes.includes('Trabajo')) {
      insights.push('El trabajo es un tema importante en tu vida');
      recommendations.push('Busca equilibrio entre trabajo y vida personal');
    }
    if (themes.includes('Relaciones')) {
      insights.push('Las relaciones interpersonales son significativas para ti');
      recommendations.push('Invierte tiempo en cultivar relaciones saludables');
    }
    if (themes.includes('Salud')) {
      insights.push('Tu bienestar físico es una prioridad');
      recommendations.push('Mantén hábitos saludables y consulta profesionales cuando sea necesario');
    }

    const result = {
      sentiment,
      themes: themes.length > 0 ? themes : ['General'],
      insights: insights.length > 0 ? insights : ['Continúa reflexionando sobre tus experiencias'],
      recommendations: recommendations.length > 0 ? recommendations : ['Mantén el hábito de escribir en tu diario'],
    };

    return result;
  } catch (error) {
    console.error('❌ Error analyzing journal entry:', error);
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
