import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Plantillas por defecto para el diario
export const defaultJournalTemplates = [
  {
    title: 'Reflexión del Día',
    description: 'Una plantilla para reflexionar sobre tu día',
    content: `# Reflexión del Día

## ¿Cómo me siento hoy?
[Describe tu estado emocional general]

## Momentos destacados
- **Positivo:** 
- **Desafiante:** 

## Aprendizajes
¿Qué aprendí hoy?

## Gratitud
¿Por qué estoy agradecido hoy?

## Mañana
¿Qué quiero lograr mañana?`,
    tags: ['diario', 'reflexión', 'gratitud'],
    category: 'daily',
    isDefault: true,
    createdBy: 'system',
  },
  {
    title: 'Análisis Semanal',
    description: 'Plantilla para revisar tu semana',
    content: `# Análisis Semanal

## Resumen de la semana
[Describe cómo fue tu semana en general]

## Logros
- 
- 
- 

## Desafíos
- 
- 
- 

## Estado emocional promedio
[Del 1 al 10]

## Lecciones aprendidas
- 
- 
- 

## Próxima semana
¿Qué quieres mejorar o lograr?`,
    tags: ['semanal', 'análisis', 'objetivos'],
    category: 'weekly',
    isDefault: true,
    createdBy: 'system',
  },
  {
    title: 'Gratitud',
    description: 'Plantilla enfocada en gratitud',
    content: `# Diario de Gratitud

## 3 cosas por las que estoy agradecido hoy:

### 1. 
[Describe la primera cosa]

### 2. 
[Describe la segunda cosa]

### 3. 
[Describe la tercera cosa]

## Persona especial
¿A quién quiero agradecer hoy y por qué?

## Momento de alegría
¿Cuál fue el momento más alegre del día?`,
    tags: ['gratitud', 'positividad', 'felicidad'],
    category: 'gratitude',
    isDefault: true,
    createdBy: 'system',
  },
];

// Prompts por defecto para el diario
export const defaultJournalPrompts = [
  {
    title: '¿Cómo te sientes hoy?',
    content: 'Describe tu estado emocional actual. ¿Qué emociones estás experimentando? ¿Hay algo específico que esté influyendo en tu estado de ánimo?',
    category: 'emotional',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['emociones', 'estado de ánimo', 'autoconocimiento'],
  },
  {
    title: 'Momento del día',
    content: 'Cuéntame sobre un momento específico de tu día que haya sido significativo. ¿Qué pasó? ¿Cómo te hizo sentir?',
    category: 'daily',
    difficulty: 'easy',
    estimatedTime: 10,
    tags: ['momento', 'significativo', 'experiencia'],
  },
  {
    title: 'Desafío superado',
    content: '¿Hubo algún desafío que enfrentaste hoy? ¿Cómo lo resolviste? ¿Qué aprendiste de esa experiencia?',
    category: 'reflection',
    difficulty: 'medium',
    estimatedTime: 15,
    tags: ['desafío', 'superación', 'aprendizaje'],
  },
  {
    title: 'Gratitud',
    content: 'Escribe sobre algo por lo que te sientes agradecido hoy. Puede ser algo grande o pequeño, pero que haya tenido un impacto positivo en tu día.',
    category: 'gratitude',
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['gratitud', 'positividad', 'bienestar'],
  },
  {
    title: 'Metas y sueños',
    content: '¿Qué metas tienes para el futuro? ¿Hay algún sueño que quieras perseguir? Describe cómo te sientes al pensar en estas aspiraciones.',
    category: 'goal-setting',
    difficulty: 'medium',
    estimatedTime: 12,
    tags: ['metas', 'sueños', 'futuro', 'aspiraciones'],
  },
  {
    title: 'Relaciones',
    content: 'Reflexiona sobre tus relaciones. ¿Hubo alguna interacción importante hoy? ¿Cómo te sientes respecto a tus conexiones con otros?',
    category: 'reflection',
    difficulty: 'medium',
    estimatedTime: 10,
    tags: ['relaciones', 'conexiones', 'interacciones'],
  },
];

// Función para inicializar datos por defecto
export const initializeDefaultJournalData = async () => {
  try {
    console.log('🔄 Inicializando datos por defecto del diario...');

    // Verificar si ya existen plantillas
    const templatesRef = collection(db, 'journalTemplates');
    const templatesQuery = query(templatesRef, where('isDefault', '==', true));
    const templatesSnapshot = await getDocs(templatesQuery);

    if (templatesSnapshot.empty) {
      console.log('📝 Creando plantillas por defecto...');
      for (const template of defaultJournalTemplates) {
        await addDoc(templatesRef, {
          ...template,
          createdAt: new Date(),
        });
      }
      console.log('✅ Plantillas creadas exitosamente');
    } else {
      console.log('📝 Las plantillas ya existen');
    }

    // Verificar si ya existen prompts
    const promptsRef = collection(db, 'journalPrompts');
    const promptsQuery = query(promptsRef, where('category', 'in', ['emotional', 'daily', 'reflection']));
    const promptsSnapshot = await getDocs(promptsQuery);

    if (promptsSnapshot.empty) {
      console.log('💡 Creando prompts por defecto...');
      for (const prompt of defaultJournalPrompts) {
        await addDoc(promptsRef, {
          ...prompt,
          createdAt: new Date(),
        });
      }
      console.log('✅ Prompts creados exitosamente');
    } else {
      console.log('💡 Los prompts ya existen');
    }

    console.log('🎉 Inicialización de datos del diario completada');
  } catch (error) {
    console.error('❌ Error inicializando datos del diario:', error);
    throw error;
  }
};
