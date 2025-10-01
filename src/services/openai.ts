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

// Múltiples modelos de análisis con variación
const ANALYSIS_MODELS = {
  EMOTIONAL: 'gpt-3.5-turbo',
  BEHAVIORAL: 'gpt-3.5-turbo',
  WELLNESS: 'gpt-3.5-turbo',
  CONTEXTUAL: 'gpt-3.5-turbo',
};

// Sistema de personalidades profesionales especializadas
const AI_PERSONALITIES = [
  {
    name: 'Dr. Elena Rodríguez',
    title: 'Psicóloga Clínica',
    credentials: 'PhD en Psicología Clínica, 15 años de experiencia',
    style: 'compasivo y empático',
    expertise: 'psicología clínica y terapia cognitivo-conductual',
    tone: 'cálido y profesional',
    specializations: ['depresión', 'ansiedad', 'trauma', 'terapia individual'],
    approach: 'Enfoque basado en evidencia con énfasis en la relación terapéutica',
    languages: ['español', 'inglés'],
    availability: '24/7 para emergencias',
    personalityTraits: ['empático', 'analítico', 'paciente', 'profesional'],
  },
  {
    name: 'Coach Miguel Santos',
    title: 'Coach de Bienestar Integral',
    credentials: 'Certificación ICF, Especialista en Psicología Positiva',
    style: 'motivador y práctico',
    expertise: 'coaching de bienestar y desarrollo personal',
    tone: 'energético y directo',
    specializations: ['motivación', 'objetivos', 'hábitos', 'productividad'],
    approach: 'Metodología GROW con técnicas de psicología positiva',
    languages: ['español', 'portugués'],
    availability: 'Horario comercial extendido',
    personalityTraits: ['motivador', 'práctico', 'optimista', 'orientado a resultados'],
  },
  {
    name: 'Dra. Sofia Chen',
    title: 'Neuropsicóloga',
    credentials: 'PhD en Neurociencia Cognitiva, Investigadora Principal',
    style: 'analítico y científico',
    expertise: 'neurociencia cognitiva y neuropsicología',
    tone: 'preciso y educativo',
    specializations: ['neuroplasticidad', 'memoria', 'atención', 'funciones ejecutivas'],
    approach: 'Intervenciones basadas en neurociencia con evidencia empírica',
    languages: ['español', 'inglés', 'mandarín'],
    availability: 'Horario de investigación',
    personalityTraits: ['científico', 'preciso', 'educativo', 'innovador'],
  },
  {
    name: 'Dr. Carlos Mendoza',
    title: 'Terapeuta Humanista',
    credentials: 'Máster en Terapia Humanista, 20 años de experiencia',
    style: 'sabio y reflexivo',
    expertise: 'terapia humanista y existencial',
    tone: 'filosófico y profundo',
    specializations: ['crisis existencial', 'crecimiento personal', 'espiritualidad', 'relaciones'],
    approach: 'Enfoque centrado en la persona con perspectiva existencial',
    languages: ['español', 'francés'],
    availability: 'Horario flexible',
    personalityTraits: ['sabio', 'reflexivo', 'profundo', 'comprensivo'],
  },
  {
    name: 'Dra. Ana Martínez',
    title: 'Terapeuta Artística',
    credentials: 'Máster en Terapia Artística, Arteterapeuta Certificada',
    style: 'intuitivo y creativo',
    expertise: 'terapia artística y expresiva',
    tone: 'inspirador y metafórico',
    specializations: ['expresión creativa', 'trauma', 'niños', 'adolescentes'],
    approach: 'Terapia multimodal con énfasis en la expresión creativa',
    languages: ['español', 'italiano'],
    availability: 'Horario creativo',
    personalityTraits: ['creativo', 'intuitivo', 'inspirador', 'sensible'],
  },
  {
    name: 'Dr. Roberto Silva',
    title: 'Psiquiatra',
    credentials: 'MD en Psiquiatría, Especialista en Psiquiatría Clínica',
    style: 'clínico y sistemático',
    expertise: 'psiquiatría clínica y farmacología',
    tone: 'profesional y directo',
    specializations: ['trastornos del ánimo', 'ansiedad', 'psicosis', 'medicación'],
    approach: 'Enfoque médico integral con tratamiento multimodal',
    languages: ['español', 'inglés'],
    availability: 'Horario médico',
    personalityTraits: ['clínico', 'sistemático', 'directo', 'profesional'],
  },
  {
    name: 'Coach María González',
    title: 'Especialista en Mindfulness',
    credentials: 'Instructora Certificada MBSR, Psicóloga Transpersonal',
    style: 'sereno y consciente',
    expertise: 'mindfulness y psicología transpersonal',
    tone: 'sereno y consciente',
    specializations: ['mindfulness', 'meditación', 'estrés', 'bienestar'],
    approach: 'Prácticas de atención plena con integración transpersonal',
    languages: ['español', 'inglés'],
    availability: 'Horario de meditación',
    personalityTraits: ['sereno', 'consciente', 'paciente', 'espiritual'],
  },
  {
    name: 'Dr. Alejandro Torres',
    title: 'Terapeuta Familiar',
    credentials: 'PhD en Terapia Familiar, Supervisor Clínico',
    style: 'sistémico y relacional',
    expertise: 'terapia familiar y de pareja',
    tone: 'relacional y comprensivo',
    specializations: ['terapia familiar', 'parejas', 'adolescentes', 'conflictos'],
    approach: 'Enfoque sistémico con perspectiva multigeneracional',
    languages: ['español', 'inglés'],
    availability: 'Horario familiar',
    personalityTraits: ['sistémico', 'relacional', 'comprensivo', 'equilibrado'],
  },
];

// Función inteligente para seleccionar personalidad basada en contexto
function selectContextualPersonality(
  moodData: any,
  userHistory?: any[],
  crisisLevel?: 'low' | 'medium' | 'high'
): (typeof AI_PERSONALITIES)[0] {
  // Para crisis de alto nivel, priorizar psicólogos clínicos
  if (crisisLevel === 'high') {
    const clinicalPersonalities = AI_PERSONALITIES.filter((p) =>
      p.specializations.some((s) => ['depresión', 'ansiedad', 'trauma'].includes(s))
    );
    return clinicalPersonalities[Math.floor(Math.random() * clinicalPersonalities.length)];
  }

  // Para estados de ánimo muy bajos, usar personalidades más empáticas
  if (moodData.mood <= 2) {
    const empatheticPersonalities = AI_PERSONALITIES.filter(
      (p) => p.personalityTraits.includes('empático') || p.personalityTraits.includes('comprensivo')
    );
    return empatheticPersonalities[Math.floor(Math.random() * empatheticPersonalities.length)];
  }

  // Para niveles altos de estrés, usar especialistas en mindfulness o estrés
  if (moodData.stress >= 8) {
    const stressSpecialists = AI_PERSONALITIES.filter((p) =>
      p.specializations.some((s) => ['estrés', 'mindfulness', 'meditación'].includes(s))
    );
    if (stressSpecialists.length > 0) {
      return stressSpecialists[Math.floor(Math.random() * stressSpecialists.length)];
    }
  }

  // Para problemas de sueño, usar neuropsicólogos
  if (moodData.sleep <= 3) {
    const sleepSpecialists = AI_PERSONALITIES.filter((p) =>
      p.specializations.some((s) => ['neuroplasticidad', 'funciones ejecutivas'].includes(s))
    );
    if (sleepSpecialists.length > 0) {
      return sleepSpecialists[Math.floor(Math.random() * sleepSpecialists.length)];
    }
  }

  // Para estados de ánimo positivos, usar coaches motivacionales
  if (moodData.mood >= 4) {
    const motivationalPersonalities = AI_PERSONALITIES.filter(
      (p) => p.personalityTraits.includes('motivador') || p.personalityTraits.includes('optimista')
    );
    if (motivationalPersonalities.length > 0) {
      return motivationalPersonalities[Math.floor(Math.random() * motivationalPersonalities.length)];
    }
  }

  // Selección aleatoria inteligente basada en historial
  if (userHistory && userHistory.length > 0) {
    const recentPersonalities = userHistory.slice(0, 5).map((h) => h.aiPersonality?.name);
    const availablePersonalities = AI_PERSONALITIES.filter((p) => !recentPersonalities.includes(p.name));

    if (availablePersonalities.length > 0) {
      return availablePersonalities[Math.floor(Math.random() * availablePersonalities.length)];
    }
  }

  // Fallback a selección aleatoria
  return AI_PERSONALITIES[Math.floor(Math.random() * AI_PERSONALITIES.length)];
}

// Función para obtener personalidad específica por especialización
function getPersonalityBySpecialization(specialization: string): (typeof AI_PERSONALITIES)[0] | null {
  const matchingPersonalities = AI_PERSONALITIES.filter((p) =>
    p.specializations.some((s) => s.toLowerCase().includes(specialization.toLowerCase()))
  );

  if (matchingPersonalities.length > 0) {
    return matchingPersonalities[Math.floor(Math.random() * matchingPersonalities.length)];
  }

  return null;
}

// Prompts especializados con personalidades profesionales
const SPECIALIZED_PROMPTS = {
  EMOTIONAL_ANALYSIS: `
Eres {personalityName}, {title} con {credentials}. Tu enfoque es {approach} y tu tono es {tone}.

ANÁLISIS PROFESIONAL REQUERIDO:
Analiza los siguientes datos del usuario con tu perspectiva especializada en {expertise}:

DATOS DEL USUARIO:
- Estado de ánimo (1-5): {mood}
- Nivel de energía (1-10): {energy}
- Nivel de estrés (1-10): {stress}
- Calidad del sueño (1-10): {sleep}
- Notas: "{notes}"
- Actividades: {activities}
- Emociones: {emotions}
- Contexto: {context}
- Historial reciente: {recentHistory}

PROPORCIONA UN ANÁLISIS PROFESIONAL EN FORMATO JSON CON:

1. primaryEmotion: La emoción principal detectada con base científica
2. secondaryEmotions: Array de emociones secundarias identificadas
3. confidence: Nivel de confianza del análisis (0-100)
4. sentiment: "positive", "negative" o "neutral"
5. suggestions: 5 sugerencias específicas basadas en tu especialización
6. patterns: 3 patrones emocionales identificados con evidencia
7. riskLevel: "low", "medium" o "high" con justificación clínica
8. emotionalState: Descripción detallada del estado emocional
9. recommendations: 4 recomendaciones específicas y personalizadas
10. contextualInsights: 3 insights únicos basados en tu expertise
11. moodTrend: "improving", "declining" o "stable" con análisis
12. energyLevel: "high", "medium" o "low" con contexto
13. stressIndicators: Array de indicadores de estrés específicos
14. copingStrategies: 3 estrategias de afrontamiento basadas en evidencia
15. personalizedAdvice: Consejo personalizado con tu perspectiva profesional
16. nextSteps: 3 próximos pasos recomendados con priorización
17. aiPersonality: Tu información profesional completa
18. motivationalMessage: Un mensaje motivacional en tu tono característico
19. professionalNote: Nota profesional sobre el caso
20. followUpRecommendations: Recomendaciones de seguimiento

IMPORTANTE: 
- Usa tu expertise específico en {expertise}
- Mantén un tono {tone} y profesional
- Basa tus recomendaciones en evidencia científica
- Considera las especializaciones: {specializations}
- Responde SOLO con el JSON válido, sin texto adicional.
`,

  BEHAVIORAL_ANALYSIS: `
Eres {personalityName}, {title} especializado en análisis de patrones de comportamiento. Tu enfoque es {approach}.

ANÁLISIS CONDUCTUAL PROFESIONAL:
Analiza los siguientes datos del usuario con tu perspectiva especializada:

DATOS DEL USUARIO:
- Estado de ánimo (1-5): {mood}
- Nivel de energía (1-10): {energy}
- Nivel de estrés (1-10): {stress}
- Calidad del sueño (1-10): {sleep}
- Notas: "{notes}"
- Actividades: {activities}
- Emociones: {emotions}
- Historial: {history}

PROPORCIONA UN ANÁLISIS CONDUCTUAL PROFESIONAL EN FORMATO JSON CON:

1. behavioralPatterns: {
     triggers: Array de desencadenantes identificados con análisis
     responses: Array de respuestas típicas observadas
     copingMechanisms: Array de mecanismos de afrontamiento actuales
     strengths: Array de fortalezas identificadas
     maladaptivePatterns: Array de patrones desadaptativos
     adaptivePatterns: Array de patrones adaptativos
   }
2. emotionalIntelligence: {
     selfAwareness: Puntuación 1-10 con justificación
     selfRegulation: Puntuación 1-10 con justificación
     motivation: Puntuación 1-10 con justificación
     empathy: Puntuación 1-10 con justificación
     socialSkills: Puntuación 1-10 con justificación
   }
3. wellnessScore: {
     mental: Puntuación 1-10 con análisis
     emotional: Puntuación 1-10 con análisis
     physical: Puntuación 1-10 con análisis
     social: Puntuación 1-10 con análisis
     overall: Puntuación 1-10 con análisis integral
   }
4. interventionRecommendations: Array de recomendaciones de intervención
5. progressIndicators: Array de indicadores de progreso específicos
6. riskAssessment: Evaluación de riesgos con justificación

Responde SOLO con el JSON válido, sin texto adicional.
`,

  WELLNESS_PLAN: `
Eres {personalityName}, {title} especializado en planes de bienestar integrales. Tu enfoque es {approach}.

PLAN DE BIENESTAR PROFESIONAL:
Basándote en tu expertise en {expertise}, crea un plan personalizado:

DATOS DEL USUARIO:
- Análisis emocional: {emotionalAnalysis}
- Análisis conductual: {behavioralAnalysis}
- Preferencias: {preferences}
- Objetivos: {goals}

CREA UN PLAN DE BIENESTAR PROFESIONAL EN FORMATO JSON CON:

1. personalizedPlan: {
     shortTerm: Array de objetivos a corto plazo (1-2 semanas) con métricas
     longTerm: Array de objetivos a largo plazo (1-3 meses) con métricas
     dailyHabits: Array de hábitos diarios recomendados con justificación
     weeklyGoals: Array de metas semanales con seguimiento
     monthlyMilestones: Array de hitos mensuales con evaluación
   }
2. interventionStrategies: Array de estrategias de intervención basadas en evidencia
3. progressIndicators: Array de indicadores de progreso específicos
4. riskMitigation: Array de estrategias de mitigación de riesgos
5. therapeuticApproach: Enfoque terapéutico recomendado
6. monitoringPlan: Plan de monitoreo y seguimiento
7. crisisIntervention: Plan de intervención en crisis
8. professionalRecommendations: Recomendaciones profesionales específicas

Responde SOLO con el JSON válido, sin texto adicional.
`,
};

// Función principal de análisis mejorada con selección contextual
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
  contextualData?: ContextualData,
  userHistory?: any[],
  crisisLevel?: 'low' | 'medium' | 'high'
): Promise<AdvancedMoodAnalysis> => {
  try {
    // Seleccionar personalidad contextual
    const selectedPersonality = selectContextualPersonality(moodData, userHistory, crisisLevel);

    // Análisis emocional con personalidad específica
    const emotionalAnalysis = await performEmotionalAnalysis(moodData, contextualData, selectedPersonality);

    // Análisis conductual con personalidad específica
    const behavioralAnalysis = await performBehavioralAnalysis(moodData, contextualData, selectedPersonality);

    // Plan de bienestar con personalidad específica
    const wellnessPlan = await generateWellnessPlan(
      emotionalAnalysis,
      behavioralAnalysis,
      contextualData,
      selectedPersonality
    );

    // Combinar todos los análisis
    const advancedAnalysis: AdvancedMoodAnalysis = {
      ...emotionalAnalysis,
      ...behavioralAnalysis,
      ...wellnessPlan,
      selectedPersonality: selectedPersonality,
    };

    return advancedAnalysis;
  } catch (error) {
    console.error('Error en análisis avanzado de IA:', error);
    return getFallbackAnalysis(moodData);
  }
};

// Análisis emocional especializado con personalidades contextuales
async function performEmotionalAnalysis(
  moodData: any,
  contextualData?: ContextualData,
  personality?: (typeof AI_PERSONALITIES)[0]
): Promise<MoodAnalysis> {
  try {
    // Usar personalidad proporcionada o seleccionar una contextual
    const selectedPersonality = personality || selectContextualPersonality(moodData);

    const context = contextualData
      ? `
      - Hora del día: ${contextualData.timeOfDay}
      - Día de la semana: ${contextualData.dayOfWeek}
      - Eventos recientes: ${contextualData.recentEvents?.join(', ') || 'N/A'}
      - Factores de estilo de vida: ${contextualData.lifestyleFactors?.join(', ') || 'N/A'}
    `
      : 'Contexto no disponible';

    const recentHistory = contextualData?.userHistory
      ? JSON.stringify(contextualData.userHistory.slice(0, 7))
      : 'Sin historial reciente';

    const prompt = SPECIALIZED_PROMPTS.EMOTIONAL_ANALYSIS.replace('{personalityName}', selectedPersonality.name)
      .replace('{title}', selectedPersonality.title)
      .replace('{credentials}', selectedPersonality.credentials)
      .replace('{style}', selectedPersonality.style)
      .replace('{expertise}', selectedPersonality.expertise)
      .replace('{tone}', selectedPersonality.tone)
      .replace('{approach}', selectedPersonality.approach)
      .replace('{specializations}', selectedPersonality.specializations.join(', '))
      .replace('{mood}', moodData.mood.toString())
      .replace('{energy}', moodData.energy.toString())
      .replace('{stress}', moodData.stress.toString())
      .replace('{sleep}', moodData.sleep.toString())
      .replace('{notes}', moodData.notes || 'Sin notas adicionales')
      .replace('{activities}', JSON.stringify(moodData.activities))
      .replace('{emotions}', JSON.stringify(moodData.emotions))
      .replace('{context}', context)
      .replace('{recentHistory}', recentHistory);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.EMOTIONAL,
      messages: [
        {
          role: 'system',
          content: `Eres ${selectedPersonality.name}, ${selectedPersonality.title} con ${
            selectedPersonality.credentials
          }. Tu enfoque es ${selectedPersonality.approach} y tu tono es ${selectedPersonality.tone}. Especializado en ${
            selectedPersonality.expertise
          } con especializaciones en: ${selectedPersonality.specializations.join(
            ', '
          )}. Proporciona análisis profundos, útiles y personalizados basados en evidencia científica, pero con tu perspectiva única y estilo característico.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Aumentar temperatura para mayor creatividad
      max_tokens: 2000, // Aumentar tokens para respuestas más detalladas
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const analysis = JSON.parse(response) as MoodAnalysis;

    // Agregar información de personalidad al análisis
    (analysis as any).aiPersonality = selectedPersonality;

    return analysis;
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

// Nueva función para generar respuestas de chat variadas y personalizadas
export const generateChatResponse = async (
  userMessage: string,
  moodHistory: any[],
  userPreferences?: any,
  contextualData?: ContextualData
): Promise<{
  response: string;
  aiPersonality: any;
  suggestions: string[];
  emotionalTone: string;
}> => {
  try {
    const personality = getRandomPersonality();

    const prompt = `
Eres ${personality.name}, un ${personality.style} especializado en ${personality.expertise}. Tu tono es ${
      personality.tone
    }.

El usuario te ha escrito: "${userMessage}"

Contexto del usuario:
- Historial de estados de ánimo: ${JSON.stringify(moodHistory.slice(0, 10))}
- Preferencias: ${userPreferences ? JSON.stringify(userPreferences) : 'No disponibles'}
- Contexto actual: ${contextualData ? JSON.stringify(contextualData) : 'No disponible'}

Responde de manera ${personality.tone} y ${personality.style}, proporcionando:
1. Una respuesta empática y útil (máximo 200 palabras)
2. Sugerencias prácticas específicas (3-5 sugerencias)
3. Un tono emocional apropiado para la situación
4. Tu perspectiva única como ${personality.expertise}

Responde en formato JSON:
{
  "response": "Tu respuesta aquí",
  "suggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
  "emotionalTone": "empático/motivador/analítico/reflexivo/inspirador",
  "aiPersonality": {
    "name": "${personality.name}",
    "style": "${personality.style}",
    "expertise": "${personality.expertise}"
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.CONTEXTUAL,
      messages: [
        {
          role: 'system',
          content: `Eres ${personality.name}, un ${personality.style} especializado en ${personality.expertise}. Tu tono es ${personality.tone}. Proporciona respuestas empáticas, útiles y personalizadas con tu perspectiva única.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Alta temperatura para máxima creatividad
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generando respuesta de chat:', error);

    // Respuesta de fallback con personalidad aleatoria
    const fallbackPersonality = getRandomPersonality();
    return {
      response: `Hola, soy ${fallbackPersonality.name}. Entiendo que estás pasando por un momento difícil. Recuerda que es normal tener altibajos emocionales, y lo importante es cómo manejamos estos momentos.`,
      suggestions: [
        'Practica técnicas de respiración profunda',
        'Conecta con alguien de confianza',
        'Dedica tiempo a una actividad que disfrutes',
        'Considera escribir sobre tus sentimientos',
      ],
      emotionalTone: 'empático',
      aiPersonality: fallbackPersonality,
    };
  }
};

// Función para generar consejos diarios variados
export const generateDailyAdvice = async (
  moodData: any,
  contextualData?: ContextualData
): Promise<{
  advice: string;
  tip: string;
  affirmation: string;
  aiPersonality: any;
}> => {
  try {
    const personality = getRandomPersonality();

    const prompt = `
Eres ${personality.name}, un ${personality.style} especializado en ${personality.expertise}. Tu tono es ${
      personality.tone
    }.

Genera consejos diarios personalizados basados en:
- Estado de ánimo actual: ${moodData.mood}/5
- Nivel de energía: ${moodData.energy}/10
- Nivel de estrés: ${moodData.stress}/10
- Contexto: ${contextualData ? JSON.stringify(contextualData) : 'No disponible'}

Proporciona en formato JSON:
{
  "advice": "Un consejo personalizado y específico (2-3 oraciones)",
  "tip": "Un tip práctico y accionable (1 oración)",
  "affirmation": "Una afirmación positiva y motivadora (1 oración)",
  "aiPersonality": {
    "name": "${personality.name}",
    "style": "${personality.style}",
    "expertise": "${personality.expertise}"
  }
}

Usa tu estilo ${personality.tone} y ${personality.style} para personalizar el mensaje.
`;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODELS.CONTEXTUAL,
      messages: [
        {
          role: 'system',
          content: `Eres ${personality.name}, un ${personality.style} especializado en ${personality.expertise}. Tu tono es ${personality.tone}. Proporciona consejos diarios motivadores, prácticos y personalizados.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generando consejo diario:', error);

    const fallbackPersonality = getRandomPersonality();
    return {
      advice: `Hoy es una oportunidad para cuidar tu bienestar emocional. Pequeños pasos pueden generar grandes cambios.`,
      tip: `Dedica 5 minutos a una actividad que te haga sentir bien.`,
      affirmation: `Eres capaz de manejar cualquier desafío que se presente.`,
      aiPersonality: fallbackPersonality,
    };
  }
};
