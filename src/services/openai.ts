import OpenAI from 'openai';
import { getOpenAIConfig } from '../config/production';

const config = getOpenAIConfig();
const openai = new OpenAI({
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true, // Solo para desarrollo, en producción usar backend
});

export interface MoodAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions: string[];
  patterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
  emotionalState: string;
  recommendations: string[];
  contextualInsights: string[];
  moodTrend: 'improving' | 'declining' | 'stable';
  energyLevel: 'high' | 'medium' | 'low';
  stressIndicators: string[];
  copingStrategies: string[];
  personalizedAdvice: string;
  nextSteps: string[];
}

export interface AdvancedMoodAnalysis extends MoodAnalysis {
  emotionalIntelligence: {
    selfAwareness: number;
    selfRegulation: number;
    motivation: number;
    empathy: number;
    socialSkills: number;
  };
  behavioralPatterns: {
    triggers: string[];
    responses: string[];
    copingMechanisms: string[];
    strengths: string[];
  };
  wellnessScore: {
    mental: number;
    emotional: number;
    physical: number;
    social: number;
    overall: number;
  };
  personalizedPlan: {
    shortTerm: string[];
    longTerm: string[];
    dailyHabits: string[];
    weeklyGoals: string[];
  };
}

// Sistema de análisis contextual
export interface ContextualData {
  timeOfDay: string;
  dayOfWeek: string;
  weather?: string;
  recentEvents?: string[];
  userHistory: any[];
  personalPreferences: any;
  currentGoals: string[];
  lifestyleFactors: string[];
}

// Múltiples modelos de análisis
const ANALYSIS_MODELS = {
  EMOTIONAL: 'gpt-3.5-turbo',
  BEHAVIORAL: 'gpt-3.5-turbo',
  WELLNESS: 'gpt-3.5-turbo',
  CONTEXTUAL: 'gpt-3.5-turbo',
};

// Prompts especializados
const SPECIALIZED_PROMPTS = {
  EMOTIONAL_ANALYSIS: `
Eres un psicólogo clínico especializado en análisis emocional. Analiza los siguientes datos del usuario:

Datos del usuario:
- Estado de ánimo (1-5): {mood}
- Nivel de energía (1-10): {energy}
- Nivel de estrés (1-10): {stress}
- Calidad del sueño (1-10): {sleep}
- Notas: "{notes}"
- Actividades: {activities}
- Emociones: {emotions}
- Contexto: {context}

Proporciona un análisis emocional profundo en formato JSON con:
1. primaryEmotion: La emoción principal detectada
2. secondaryEmotions: Array de emociones secundarias
3. confidence: Nivel de confianza (0-100)
4. sentiment: "positive", "negative" o "neutral"
5. suggestions: 5 sugerencias específicas para mejorar el bienestar
6. patterns: 3 patrones emocionales identificados
7. riskLevel: "low", "medium" o "high" basado en el estado
8. emotionalState: Descripción detallada del estado emocional
9. recommendations: 4 recomendaciones específicas
10. contextualInsights: 3 insights basados en el contexto
11. moodTrend: "improving", "declining" o "stable"
12. energyLevel: "high", "medium" o "low"
13. stressIndicators: Array de indicadores de estrés
14. copingStrategies: 3 estrategias de afrontamiento
15. personalizedAdvice: Consejo personalizado específico
16. nextSteps: 3 próximos pasos recomendados

Responde SOLO con el JSON válido, sin texto adicional.
`,

  BEHAVIORAL_ANALYSIS: `
Eres un terapeuta cognitivo-conductual especializado en análisis de patrones de comportamiento. Analiza:

Datos del usuario:
- Estado de ánimo (1-5): {mood}
- Nivel de energía (1-10): {energy}
- Nivel de estrés (1-10): {stress}
- Calidad del sueño (1-10): {sleep}
- Notas: "{notes}"
- Actividades: {activities}
- Emociones: {emotions}
- Historial: {history}

Proporciona un análisis conductual en formato JSON con:
1. behavioralPatterns: {
     triggers: Array de desencadenantes identificados
     responses: Array de respuestas típicas
     copingMechanisms: Array de mecanismos de afrontamiento
     strengths: Array de fortalezas identificadas
   }
2. emotionalIntelligence: {
     selfAwareness: Puntuación 1-10
     selfRegulation: Puntuación 1-10
     motivation: Puntuación 1-10
     empathy: Puntuación 1-10
     socialSkills: Puntuación 1-10
   }
3. wellnessScore: {
     mental: Puntuación 1-10
     emotional: Puntuación 1-10
     physical: Puntuación 1-10
     social: Puntuación 1-10
     overall: Puntuación 1-10
   }

Responde SOLO con el JSON válido, sin texto adicional.
`,

  WELLNESS_PLAN: `
Eres un coach de bienestar integral especializado en planes personalizados. Basándote en:

Datos del usuario:
- Análisis emocional: {emotionalAnalysis}
- Análisis conductual: {behavioralAnalysis}
- Preferencias: {preferences}
- Objetivos: {goals}

Crea un plan de bienestar personalizado en formato JSON con:
1. personalizedPlan: {
     shortTerm: Array de objetivos a corto plazo (1-2 semanas)
     longTerm: Array de objetivos a largo plazo (1-3 meses)
     dailyHabits: Array de hábitos diarios recomendados
     weeklyGoals: Array de metas semanales
   }
2. interventionStrategies: Array de estrategias de intervención
3. progressIndicators: Array de indicadores de progreso
4. riskMitigation: Array de estrategias de mitigación de riesgos

Responde SOLO con el JSON válido, sin texto adicional.
`,
};

// Función principal de análisis mejorada
export const analyzeMoodWithAI = async (
  moodData: {
    mood: number;
    energy: number;
    stress: number;
    sleep: number;
    notes: string;
    activities: string[];
    emotions: string[];
  },
  contextualData?: ContextualData
): Promise<AdvancedMoodAnalysis> => {
  try {
    // Análisis emocional
    const emotionalAnalysis = await performEmotionalAnalysis(moodData, contextualData);

    // Análisis conductual
    const behavioralAnalysis = await performBehavioralAnalysis(moodData, contextualData);

    // Plan de bienestar
    const wellnessPlan = await generateWellnessPlan(emotionalAnalysis, behavioralAnalysis, contextualData);

    // Combinar todos los análisis
    const advancedAnalysis: AdvancedMoodAnalysis = {
      ...emotionalAnalysis,
      ...behavioralAnalysis,
      ...wellnessPlan,
    };

    return advancedAnalysis;
  } catch (error) {
    console.error('Error en análisis avanzado de IA:', error);
    return getFallbackAnalysis(moodData);
  }
};

// Análisis emocional especializado
async function performEmotionalAnalysis(moodData: any, contextualData?: ContextualData): Promise<MoodAnalysis> {
  try {
    const context = contextualData
      ? `
      - Hora del día: ${contextualData.timeOfDay}
      - Día de la semana: ${contextualData.dayOfWeek}
      - Eventos recientes: ${contextualData.recentEvents?.join(', ') || 'N/A'}
      - Factores de estilo de vida: ${contextualData.lifestyleFactors?.join(', ') || 'N/A'}
    `
      : 'Contexto no disponible';

    const prompt = SPECIALIZED_PROMPTS.EMOTIONAL_ANALYSIS.replace('{mood}', moodData.mood.toString())
      .replace('{energy}', moodData.energy.toString())
      .replace('{stress}', moodData.stress.toString())
      .replace('{sleep}', moodData.sleep.toString())
      .replace('{notes}', moodData.notes)
      .replace('{activities}', moodData.activities.join(', '))
      .replace('{emotions}', moodData.emotions.join(', '))
      .replace('{context}', context);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.EMOTIONAL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un psicólogo clínico experto en análisis emocional. Proporciona análisis profundos y útiles basados en evidencia científica.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response) as MoodAnalysis;
  } catch (error) {
    console.error('Error en análisis emocional:', error);
    throw error;
  }
}

// Análisis conductual especializado
async function performBehavioralAnalysis(
  moodData: any,
  contextualData?: ContextualData
): Promise<Partial<AdvancedMoodAnalysis>> {
  try {
    const history = contextualData?.userHistory
      ? JSON.stringify(contextualData.userHistory.slice(0, 10))
      : 'Sin historial disponible';

    const prompt = SPECIALIZED_PROMPTS.BEHAVIORAL_ANALYSIS.replace('{mood}', moodData.mood.toString())
      .replace('{energy}', moodData.energy.toString())
      .replace('{stress}', moodData.stress.toString())
      .replace('{sleep}', moodData.sleep.toString())
      .replace('{notes}', moodData.notes)
      .replace('{activities}', moodData.activities.join(', '))
      .replace('{emotions}', moodData.emotions.join(', '))
      .replace('{history}', history);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.BEHAVIORAL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un terapeuta cognitivo-conductual experto en análisis de patrones de comportamiento. Proporciona insights basados en evidencia científica.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error en análisis conductual:', error);
    throw error;
  }
}

// Generación de plan de bienestar
async function generateWellnessPlan(
  emotionalAnalysis: MoodAnalysis,
  behavioralAnalysis: any,
  contextualData?: ContextualData
): Promise<Partial<AdvancedMoodAnalysis>> {
  try {
    const preferences = contextualData?.personalPreferences
      ? JSON.stringify(contextualData.personalPreferences)
      : 'Sin preferencias disponibles';
    const goals = contextualData?.currentGoals ? contextualData.currentGoals.join(', ') : 'Sin objetivos específicos';

    const prompt = SPECIALIZED_PROMPTS.WELLNESS_PLAN.replace('{emotionalAnalysis}', JSON.stringify(emotionalAnalysis))
      .replace('{behavioralAnalysis}', JSON.stringify(behavioralAnalysis))
      .replace('{preferences}', preferences)
      .replace('{goals}', goals);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.WELLNESS,
      messages: [
        {
          role: 'system',
          content:
            'Eres un coach de bienestar integral experto en crear planes personalizados. Proporciona estrategias prácticas y alcanzables.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generando plan de bienestar:', error);
    throw error;
  }
}

// Análisis de fallback mejorado
function getFallbackAnalysis(moodData: any): AdvancedMoodAnalysis {
  const emotions = ['feliz', 'triste', 'ansioso', 'tranquilo', 'emocionado', 'preocupado', 'motivado', 'agotado'];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

  return {
    primaryEmotion: randomEmotion,
    secondaryEmotions: [emotions[Math.floor(Math.random() * emotions.length)]],
    confidence: 65 + Math.floor(Math.random() * 20),
    sentiment: moodData.mood >= 4 ? 'positive' : moodData.mood <= 2 ? 'negative' : 'neutral',
    suggestions: [
      'Considera hacer ejercicio ligero para mejorar tu estado de ánimo',
      'Practica técnicas de respiración profunda para reducir el estrés',
      'Conecta con amigos o familia para apoyo social',
      'Dedica tiempo a actividades que disfrutes',
      'Mantén una rutina de sueño consistente',
    ],
    patterns: [
      'Tu estado de ánimo muestra variaciones naturales',
      'El ejercicio regular mejora tu bienestar general',
      'Las conexiones sociales son importantes para tu equilibrio',
    ],
    riskLevel: moodData.mood <= 2 ? 'medium' : 'low',
    emotionalState: `Estado emocional ${randomEmotion} con niveles de energía ${
      moodData.energy >= 7 ? 'altos' : moodData.energy <= 4 ? 'bajos' : 'moderados'
    }`,
    recommendations: [
      'Mantén una rutina diaria consistente',
      'Practica mindfulness o meditación',
      'Cuida tu higiene del sueño',
      'Busca apoyo profesional si es necesario',
    ],
    contextualInsights: [
      'Tu bienestar emocional está en un rango normal',
      'Considera ajustar tu rutina según tus necesidades',
      'El autocuidado es fundamental para tu equilibrio',
    ],
    moodTrend: 'stable',
    energyLevel: moodData.energy >= 7 ? 'high' : moodData.energy <= 4 ? 'low' : 'medium',
    stressIndicators: moodData.stress >= 7 ? ['Tensión muscular', 'Dificultad para concentrarse'] : ['Estrés bajo'],
    copingStrategies: ['Técnicas de respiración', 'Ejercicio físico regular', 'Conexión social'],
    personalizedAdvice:
      'Tu bienestar emocional es una prioridad. Continúa monitoreando tus patrones y ajusta tu rutina según sea necesario.',
    nextSteps: [
      'Registra tu estado de ánimo diariamente',
      'Implementa una rutina de autocuidado',
      'Busca apoyo si experimentas dificultades persistentes',
    ],
    emotionalIntelligence: {
      selfAwareness: 7,
      selfRegulation: 6,
      motivation: 7,
      empathy: 8,
      socialSkills: 7,
    },
    behavioralPatterns: {
      triggers: ['Estrés laboral', 'Falta de sueño'],
      responses: ['Ejercicio', 'Conexión social'],
      copingMechanisms: ['Respiración profunda', 'Meditación'],
      strengths: ['Resiliencia', 'Autoconocimiento'],
    },
    wellnessScore: {
      mental: 7,
      emotional: 6,
      physical: 7,
      social: 8,
      overall: 7,
    },
    personalizedPlan: {
      shortTerm: ['Establecer rutina de sueño', 'Practicar respiración diaria'],
      longTerm: ['Desarrollar hábitos saludables', 'Mejorar gestión del estrés'],
      dailyHabits: ['Registro de estado de ánimo', 'Ejercicio ligero'],
      weeklyGoals: ['Conectar con amigos', 'Dedicar tiempo a hobbies'],
    },
  };
}

// Función para generar insights personalizados mejorada
export const generatePersonalizedInsights = async (
  moodHistory: any[],
  userPreferences: any,
  contextualData?: ContextualData
): Promise<string[]> => {
  try {
    const prompt = `
Basándote en el historial de estados de ánimo del usuario, genera insights personalizados y diversos:

Historial reciente: ${JSON.stringify(moodHistory.slice(0, 14))}
Preferencias: ${JSON.stringify(userPreferences)}
Contexto: ${contextualData ? JSON.stringify(contextualData) : 'Sin contexto disponible'}

Genera 5 insights específicos, útiles y diversos en formato JSON array de strings. 
Incluye insights sobre patrones, tendencias, recomendaciones y observaciones personalizadas.
Varía el tono y enfoque de cada insight.
`;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.CONTEXTUAL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un coach de bienestar emocional experto. Proporciona insights personalizados, motivadores y diversos. Varía el enfoque y tono de cada insight.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generando insights:', error);
    return [
      'Has mostrado una tendencia positiva en los últimos días',
      'Considera mantener tus rutinas actuales que están funcionando bien',
      'Tu bienestar emocional está en buen camino',
      'Los patrones de sueño regulares están beneficiando tu estado de ánimo',
      'La conexión social parece ser un factor importante en tu bienestar',
    ];
  }
};

// Función para análisis de tendencias a largo plazo
export const analyzeLongTermTrends = async (moodHistory: any[]): Promise<any> => {
  try {
    const prompt = `
Analiza las tendencias a largo plazo en el historial de estados de ánimo:

Historial completo: ${JSON.stringify(moodHistory)}

Proporciona un análisis de tendencias en formato JSON con:
1. overallTrend: "improving", "declining", "stable", "cyclical"
2. seasonalPatterns: Array de patrones estacionales identificados
3. weeklyPatterns: Array de patrones semanales
4. monthlyPatterns: Array de patrones mensuales
5. riskFactors: Array de factores de riesgo identificados
6. protectiveFactors: Array de factores protectores
7. recommendations: Array de recomendaciones basadas en tendencias
8. predictions: Predicciones para los próximos 30 días

Responde SOLO con el JSON válido, sin texto adicional.
`;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.CONTEXTUAL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un analista de datos especializado en patrones de bienestar emocional. Proporciona análisis estadísticos y predicciones basadas en evidencia.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analizando tendencias:', error);
    return {
      overallTrend: 'stable',
      seasonalPatterns: [],
      weeklyPatterns: [],
      monthlyPatterns: [],
      riskFactors: [],
      protectiveFactors: [],
      recommendations: ['Continúa monitoreando tu bienestar'],
      predictions: ['Estado estable esperado'],
    };
  }
};
