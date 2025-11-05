// AI Service for Mood Analysis and Recommendations
export interface MoodAnalysis {
  overallMood: number;
  energy: number;
  stress: number;
  sleep: number;
  activities: string[];
  emotions: string[];
  feelings: string;
}

export interface AIRecommendation {
  type: 'energy' | 'stress' | 'sleep' | 'mood' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: string;
  category: string;
}

export interface MoodAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: AIRecommendation[];
  moodTrend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  // Nuevos análisis separados
  emotionalRegulation?: {
    title: string;
    description: string;
    strategies: string[];
  };
  wellBeingMaintenance?: {
    title: string;
    description: string;
    strategies: string[];
  };
  textualAnalysis?: {
    title: string;
    description: string;
    insights: string[];
    recommendations: string[];
  };
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using OpenAI API for real AI analysis
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async analyzeMood(moodData: MoodAnalysis): Promise<MoodAnalysisResult> {
    try {
      // Always use fallback analysis for now to ensure recommendations are shown
      // TODO: Implement real AI analysis when API key is available
      return this.getFallbackAnalysis(moodData);
      
      // Commented out real AI analysis for now
      /*
      // If no API key, return fallback analysis
      if (!this.apiKey) {
        return this.getFallbackAnalysis(moodData);
      }

      const prompt = this.buildAnalysisPrompt(moodData);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un psicólogo experto en análisis de estado de ánimo. Proporciona análisis profesionales y recomendaciones prácticas basadas en datos de bienestar emocional.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      return this.parseAIResponse(analysisText, moodData);
      */
    } catch (error) {
      console.error('Error calling AI service:', error);
      return this.getFallbackAnalysis(moodData);
    }
  }

  private buildAnalysisPrompt(moodData: MoodAnalysis): string {
    const timestamp = new Date().toISOString();
    const randomSeed = Math.random().toString(36).substring(7);
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    const randomPerspective = [
      'perspectiva cognitivo-conductual', 'enfoque humanista', 'abordaje sistémico', 'perspectiva mindfulness',
      'enfoque psicodinámico', 'abordaje centrado en soluciones', 'perspectiva positiva', 'enfoque integrativo'
    ];
    
    const randomStyle = [
      'análisis reflexivo', 'evaluación empática', 'revisión comprensiva', 'análisis detallado',
      'evaluación personalizada', 'análisis profundo', 'revisión cuidadosa', 'evaluación holística'
    ];
    
    return `
Eres un psicólogo clínico especializado en análisis de estados de ánimo. Realiza un ${randomStyle[Math.floor(Math.random() * randomStyle.length)]} desde una ${randomPerspective[Math.floor(Math.random() * randomPerspective.length)]}.

DATOS ESPECÍFICOS DEL USUARIO:
- Estado de ánimo general: ${moodData.overallMood}/10
- Energía: ${moodData.energy}/10
- Estrés: ${moodData.stress}/10
- Calidad del sueño: ${moodData.sleep}/10
- Actividades realizadas: ${moodData.activities.join(', ') || 'No especificadas'}
- Emociones identificadas: ${moodData.emotions.join(', ') || 'No especificadas'}
- Descripción personal: "${moodData.feelings}"

CONTEXTO ÚNICO: ${timestamp}
SEMILLA DE PERSONALIZACIÓN: ${randomSeed}
IDENTIFICADOR DE SESIÓN: ${sessionId}

INSTRUCCIONES CRÍTICAS:
- Proporciona análisis ÚNICO y personalizado basado en estos datos específicos
- Evita respuestas genéricas o repetitivas - cada análisis debe ser diferente
- Incluye detalles específicos del perfil emocional del usuario
- Sé empático y profesional pero específico
- Considera el contexto individual y único
- Varía tu estilo de comunicación y enfoque terapéutico
- Incluye observaciones únicas basadas en los patrones específicos

Formato de respuesta en JSON:
{
  "summary": "Resumen personalizado y específico del estado emocional único del usuario",
  "insights": ["Insight específico basado en sus datos únicos", "Patrón identificado personalizado", "Observación clínica relevante"],
  "recommendations": [
    {
      "type": "energy|stress|sleep|mood|general",
      "priority": "high|medium|low",
      "title": "Título específico de la recomendación",
      "description": "Descripción detallada y personalizada",
      "actionable": "Pasos específicos adaptados al usuario",
      "category": "Categoría de la recomendación"
    }
  ],
  "moodTrend": "improving|stable|declining",
  "riskLevel": "low|medium|high"
}
    `;
  }

  private parseAIResponse(responseText: string, moodData: MoodAnalysis): MoodAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Análisis completado',
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || [],
          moodTrend: parsed.moodTrend || 'stable',
          riskLevel: parsed.riskLevel || 'low',
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback if parsing fails
    return this.getFallbackAnalysis(moodData);
  }

  private getFallbackAnalysis(moodData: MoodAnalysis): MoodAnalysisResult {
    const recommendations: AIRecommendation[] = [];
    
    // Generate detailed recommendations based on mood data
    if (moodData.overallMood <= 2) {
      recommendations.push({
        type: 'mood',
        priority: 'high',
        title: 'Plan de Apoyo Emocional Integral',
        description: `Tu estado de ánimo actual (${moodData.overallMood}/5) indica que necesitas atención especializada. Es importante implementar estrategias de apoyo inmediato y a largo plazo.`,
        actionable: `1. Contacta a un profesional de salud mental (psicólogo o psiquiatra) para evaluación\n2. Establece una red de apoyo con familiares y amigos de confianza\n3. Implementa técnicas de respiración profunda (4-7-8) durante episodios difíciles\n4. Mantén un diario emocional para identificar patrones y desencadenantes\n5. Considera terapia cognitivo-conductual para cambiar patrones de pensamiento negativos`,
        category: 'Salud Mental Crítica'
      });
    } else if (moodData.overallMood >= 4) {
      recommendations.push({
        type: 'mood',
        priority: 'low',
        title: 'Estrategia de Mantenimiento del Bienestar',
        description: `Excelente estado de ánimo (${moodData.overallMood}/5). Es crucial mantener estos niveles positivos mediante estrategias preventivas y de consolidación.`,
        actionable: `1. Mantén tu rutina actual que te está funcionando bien\n2. Practica gratitud diaria escribiendo 3 cosas positivas cada mañana\n3. Ayuda a otros: el altruismo refuerza el bienestar personal\n4. Establece metas pequeñas y alcanzables para mantener la motivación\n5. Comparte tu experiencia positiva con otros que puedan beneficiarse`,
        category: 'Mantenimiento Positivo'
      });
    }

    // Detailed energy management
    if (moodData.energy < 5) {
      recommendations.push({
        type: 'energy',
        priority: 'medium',
        title: 'Protocolo de Reactivación Energética',
        description: `Tu nivel de energía (${moodData.energy}/10) está significativamente bajo. Esto puede afectar tu estado de ánimo, productividad y calidad de vida general.`,
        actionable: `1. Ejercicio gradual: Comienza con 10 minutos de caminata al aire libre\n2. Hidratación: Bebe 8 vasos de agua durante el día\n3. Exposición solar: 15-20 minutos de luz natural por la mañana\n4. Micro-descansos: Toma 5 minutos cada hora para estirar o respirar\n5. Alimentación energética: Consume proteínas, frutas y vegetales frescos\n6. Sueño reparador: Establece horarios consistentes de descanso`,
        category: 'Optimización Energética'
      });
    } else if (moodData.energy > 7) {
      recommendations.push({
        type: 'energy',
        priority: 'low',
        title: 'Gestión de Alta Energía',
        description: `Tu energía alta (${moodData.energy}/10) es una fortaleza. Aprende a canalizarla efectivamente para maximizar tu potencial.`,
        actionable: `1. Canaliza tu energía en proyectos creativos o físicos\n2. Establece metas desafiantes pero realistas\n3. Comparte tu energía positiva con otros\n4. Mantén el equilibrio: no te agotes completamente\n5. Usa tu energía para ayudar a otros o aprender algo nuevo`,
        category: 'Optimización de Alto Rendimiento'
      });
    }

    // Detailed stress management
    if (moodData.stress > 6) {
      recommendations.push({
        type: 'stress',
        priority: 'high',
        title: 'Plan Integral de Reducción del Estrés',
        description: `Tu nivel de estrés (${moodData.stress}/10) es preocupante y puede impactar negativamente tu salud física y mental. Necesitas intervención inmediata.`,
        actionable: `1. Técnica de respiración 4-7-8: Inhala 4 segundos, mantén 7, exhala 8\n2. Meditación mindfulness: 10 minutos diarios usando apps como Headspace\n3. Ejercicio físico: 30 minutos de actividad moderada para liberar endorfinas\n4. Organización: Haz listas de tareas y prioriza usando la matriz de Eisenhower\n5. Límites saludables: Aprende a decir "no" sin culpa\n6. Apoyo profesional: Considera terapia para manejo del estrés crónico`,
        category: 'Gestión del Estrés Crítico'
      });
    }

    // Detailed sleep optimization
    if (moodData.sleep < 5) {
      recommendations.push({
        type: 'sleep',
        priority: 'medium',
        title: 'Protocolo de Higiene del Sueño',
        description: `La calidad de tu sueño (${moodData.sleep}/10) necesita atención inmediata. El sueño deficiente afecta directamente el estado de ánimo, energía y capacidad cognitiva.`,
        actionable: `1. Rutina pre-sueño: 1 hora antes de dormir, evita pantallas y actividades estimulantes\n2. Ambiente óptimo: Temperatura 18-20°C, oscuridad total, silencio\n3. Horarios consistentes: Acuéstate y levántate a la misma hora todos los días\n4. Evita cafeína después de las 2 PM y alcohol antes de dormir\n5. Técnicas de relajación: Respiración profunda o relajación muscular progresiva\n6. Si no puedes dormir en 20 minutos, levántate y haz algo relajante`,
        category: 'Optimización del Sueño'
      });
    }

    // Activity-based recommendations
    if (moodData.activities.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Plan de Activación Personal',
        description: `No se registraron actividades específicas hoy. La falta de actividades estructuradas puede contribuir a estados de ánimo bajos y falta de propósito.`,
        actionable: `1. Actividades físicas: Caminar, yoga, baile, o cualquier ejercicio que disfrutes\n2. Actividades creativas: Dibujar, escribir, cocinar, jardinería, música\n3. Actividades sociales: Llamar a un amigo, unirse a un grupo, voluntariado\n4. Actividades de aprendizaje: Leer, cursos online, aprender un idioma\n5. Actividades de relajación: Meditación, baño relajante, masaje\n6. Establece una rutina diaria con al menos 2 actividades diferentes`,
        category: 'Activación Conductual'
      });
    }

    // Emotion-specific recommendations
    if (moodData.emotions.length > 0) {
      const negativeEmotions = moodData.emotions.filter(emotion => 
        ['tristeza', 'ansiedad', 'preocupación', 'ira', 'frustración', 'miedo', 'culpa', 'vergüenza'].includes(emotion.toLowerCase())
      );
      
      if (negativeEmotions.length > 0) {
        recommendations.push({
          type: 'mood',
          priority: 'high',
          title: 'Estrategias de Regulación Emocional',
          description: `Identificaste emociones desafiantes: ${negativeEmotions.join(', ')}. Estas emociones son válidas y normales, pero necesitan manejo adecuado.`,
          actionable: `1. Validación emocional: Reconoce que tus emociones son válidas y temporales\n2. Técnica STOP: Para, respira, observa tus pensamientos, procede con calma\n3. Escritura terapéutica: Escribe sobre tus emociones sin juzgarlas\n4. Distracción saludable: Actividades que requieran concentración (puzzles, música)\n5. Apoyo social: Habla con alguien de confianza sobre tus sentimientos\n6. Técnicas de grounding: 5-4-3-2-1 (5 cosas que ves, 4 que tocas, etc.)`,
          category: 'Regulación Emocional Avanzada'
        });
      }
    }

    // Ensure we have exactly 2 detailed recommendations
    if (recommendations.length < 2) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Plan de Bienestar Integral',
        description: `Basado en tu perfil actual, aquí tienes estrategias para optimizar tu bienestar general y prevenir problemas futuros.`,
        actionable: `1. Autocuidado diario: Dedica 30 minutos diarios a actividades que disfrutes\n2. Conexión social: Mantén contacto regular con personas importantes en tu vida\n3. Propósito: Identifica valores personales y alinea tus acciones con ellos\n4. Gratitud: Practica reconocer 3 cosas positivas cada día\n5. Flexibilidad: Mantén una actitud abierta al cambio y nuevas experiencias\n6. Prevención: Realiza chequeos regulares de salud mental y física`,
        category: 'Bienestar Preventivo'
      });
    }

    // Limit to 2 most relevant recommendations
    const finalRecommendations = recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 2);

    const insights = [
      `Estado de ánimo: ${moodData.overallMood <= 2 ? 'Crítico - Requiere atención inmediata' : moodData.overallMood >= 4 ? 'Excelente - Mantén las estrategias actuales' : 'Moderado - Monitorea y ajusta según sea necesario'}`,
      `Energía: ${moodData.energy < 5 ? 'Baja - Implementa estrategias de reactivación' : moodData.energy > 7 ? 'Alta - Canaliza efectivamente' : 'Equilibrada - Mantén el balance'}`,
      `Estrés: ${moodData.stress > 6 ? 'Alto - Implementa técnicas de reducción inmediata' : moodData.stress < 4 ? 'Bajo - Excelente manejo' : 'Moderado - Continúa monitoreando'}`,
    ];

    if (moodData.emotions.length > 0) {
      insights.push(`Emociones identificadas: ${moodData.emotions.join(', ')}`);
    }

    if (moodData.activities.length > 0) {
      insights.push(`Actividades realizadas: ${moodData.activities.join(', ')}`);
    }

    // Generar análisis de regulación emocional
    const emotionalRegulation = this.generateEmotionalRegulationAnalysis(moodData);
    
    // Generar análisis de mantenimiento del bienestar
    const wellBeingMaintenance = this.generateWellBeingMaintenanceAnalysis(moodData);
    
    // Generar análisis textual basado en el texto ingresado
    const textualAnalysis = this.generateTextualAnalysis(moodData);

    return {
      summary: `Análisis personalizado basado en tu estado de ánimo (${moodData.overallMood.toFixed(1)}/5), energía (${moodData.energy.toFixed(1)}/10), estrés (${moodData.stress.toFixed(1)}/10) y sueño (${moodData.sleep.toFixed(1)}/10). ${moodData.feelings ? `Tus sentimientos: "${moodData.feelings}"` : ''}`,
      insights,
      recommendations: finalRecommendations,
      moodTrend: moodData.overallMood >= 4 ? 'improving' : moodData.overallMood <= 2 ? 'declining' : 'stable',
      riskLevel: moodData.overallMood <= 2 && moodData.stress > 7 ? 'high' : moodData.overallMood <= 3 ? 'medium' : 'low',
      emotionalRegulation,
      wellBeingMaintenance,
      textualAnalysis,
    };
  }

  private generateEmotionalRegulationAnalysis(moodData: MoodAnalysis): {
    title: string;
    description: string;
    strategies: string[];
  } {
    const negativeEmotions = moodData.emotions.filter(emotion => 
      ['Tristeza', 'Ansiedad', 'Enojo', 'Miedo', 'Frustración', 'Desesperación', 'Vergüenza'].includes(emotion)
    );

    if (negativeEmotions.length === 0) {
      return {
        title: 'Estrategias de Regulación Emocional',
        description: 'No se identificaron emociones desafiantes en este momento. Estas estrategias te ayudarán a mantener el equilibrio emocional.',
        strategies: [
          'Validación emocional: Reconoce que todas las emociones son válidas y temporales',
          'Técnica STOP: Para, respira profundamente, observa tus pensamientos sin juzgar, procede con calma',
          'Escritura terapéutica: Escribe sobre tus emociones sin autocensura',
          'Distracción saludable: Actividades que requieran concentración (puzzles, música, lectura)',
          'Apoyo social: Habla con alguien de confianza sobre tus sentimientos',
          'Técnicas de grounding: 5-4-3-2-1 (5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas)'
        ]
      };
    }

    return {
      title: 'Estrategias de Regulación Emocional',
      description: `Identificaste emociones desafiantes: ${negativeEmotions.join(', ')}. Estas emociones son válidas y normales, pero necesitan manejo adecuado.`,
      strategies: [
        'Validación emocional: Reconoce que tus emociones son válidas y temporales',
        'Técnica STOP: Para, respira, observa tus pensamientos, procede con calma',
        'Escritura terapéutica: Escribe sobre tus emociones sin juzgarlas',
        'Distracción saludable: Actividades que requieran concentración (puzzles, música)',
        'Apoyo social: Habla con alguien de confianza sobre tus sentimientos',
        'Técnicas de grounding: 5-4-3-2-1 (5 cosas que ves, 4 que tocas, etc.)'
      ]
    };
  }

  private generateWellBeingMaintenanceAnalysis(moodData: MoodAnalysis): {
    title: string;
    description: string;
    strategies: string[];
  } {
    const moodLabel = moodData.overallMood <= 2 ? 'Muy mal' : 
                     moodData.overallMood <= 4 ? 'Regular' : 
                     moodData.overallMood <= 6 ? 'Bien' : 
                     moodData.overallMood <= 8 ? 'Muy bien' : 'Excelente';

    if (moodData.overallMood >= 4) {
      return {
        title: 'Estrategia de Mantenimiento del Bienestar',
        description: `Excelente estado de ánimo (${moodLabel}, ${moodData.overallMood}/5). Es crucial mantener estos niveles positivos mediante estrategias preventivas y de consolidación.`,
        strategies: [
          'Mantén tu rutina actual que te está funcionando bien',
          'Practica gratitud diaria escribiendo 3 cosas positivas cada mañana',
          'Ayuda a otros: el altruismo refuerza el bienestar personal',
          'Establece metas pequeñas y alcanzables para mantener la motivación',
          'Comparte tu experiencia positiva con otros que puedan beneficiarse'
        ]
      };
    }

    return {
      title: 'Estrategia de Mantenimiento del Bienestar',
      description: `Tu estado de ánimo actual (${moodLabel}, ${moodData.overallMood}/5) puede mejorarse con estrategias de bienestar preventivas.`,
      strategies: [
        'Establece una rutina diaria que incluya actividades placenteras',
        'Practica gratitud diaria identificando al menos una cosa positiva',
        'Mantén conexiones sociales regulares con personas importantes',
        'Realiza actividad física ligera para mejorar el estado de ánimo',
        'Establece pequeñas metas diarias que te den sensación de logro'
      ]
    };
  }

  private generateTextualAnalysis(moodData: MoodAnalysis): {
    title: string;
    description: string;
    insights: string[];
    recommendations: string[];
  } {
    if (!moodData.feelings || moodData.feelings.trim().length === 0) {
      return {
        title: 'Análisis de tu Reflexión Personal',
        description: 'No proporcionaste una descripción textual de tus sentimientos. Compartir tus pensamientos ayuda a generar análisis más personalizados.',
        insights: [
          'Considera escribir sobre tus sentimientos para obtener insights más específicos',
          'La escritura expresiva puede ser una herramienta terapéutica poderosa'
        ],
        recommendations: [
          'Próxima vez, intenta escribir al menos unas líneas sobre cómo te sientes',
          'La escritura libre sin autocensura puede revelar patrones emocionales importantes'
        ]
      };
    }

    const feelingsLower = moodData.feelings.toLowerCase();
    const emotionsText = moodData.emotions.join(', ').toLowerCase();
    const moodValue = moodData.overallMood;

    // Análisis de sentimientos positivos
    const positiveWords = ['feliz', 'contento', 'bien', 'genial', 'excelente', 'mejor', 'alegre', 'satisfecho', 'gratitud', 'agradecido'];
    const hasPositive = positiveWords.some(word => feelingsLower.includes(word));

    // Análisis de sentimientos negativos
    const negativeWords = ['triste', 'mal', 'preocupado', 'ansioso', 'estresado', 'difícil', 'problema', 'malo', 'malestar', 'dolor'];
    const hasNegative = negativeWords.some(word => feelingsLower.includes(word));

    // Análisis de preocupaciones
    const worryWords = ['preocupación', 'miedo', 'ansiedad', 'nervioso', 'angustiado', 'tensión'];
    const hasWorry = worryWords.some(word => feelingsLower.includes(word));

    // Análisis de gratitud
    const gratitudeWords = ['gratitud', 'agradecido', 'bendecido', 'afortunado', 'suerte'];
    const hasGratitude = gratitudeWords.some(word => feelingsLower.includes(word));

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Insights basados en el texto
    if (hasPositive && moodValue >= 4) {
      insights.push('Tu descripción refleja un estado emocional positivo que coincide con tu evaluación numérica del estado de ánimo');
      recommendations.push('Continúa cultivando estos momentos positivos y documenta qué te ayuda a mantener este bienestar');
    }

    if (hasNegative && moodValue <= 3) {
      insights.push('Tu descripción textual coincide con un estado de ánimo bajo, lo que indica autoconciencia emocional');
      recommendations.push('Considera técnicas de reestructuración cognitiva para cambiar patrones de pensamiento negativos');
    }

    if (hasWorry) {
      insights.push(`Identificaste preocupaciones en tu descripción. Las emociones de ${emotionsText} pueden estar relacionadas con estas preocupaciones`);
      recommendations.push('Practica técnicas de mindfulness para observar tus preocupaciones sin quedarte atrapado en ellas');
    }

    if (hasGratitude) {
      insights.push('El reconocimiento de gratitud en tu descripción es una fortaleza emocional importante');
      recommendations.push('Amplía esta práctica de gratitud escribiendo un diario de gratitud diario');
    }

    // Análisis de coherencia entre texto y emociones
    if (moodData.emotions.length > 0) {
      const emotionsInText = moodData.emotions.some(emotion => 
        feelingsLower.includes(emotion.toLowerCase())
      );
      
      if (emotionsInText) {
        insights.push('Hay coherencia entre las emociones que seleccionaste y lo que describes en tu texto');
      } else {
        insights.push('Tu descripción textual puede revelar emociones adicionales a las que seleccionaste');
      }
    }

    // Análisis de longitud y profundidad
    if (moodData.feelings.length > 100) {
      insights.push('Tu descripción detallada muestra una buena capacidad de introspección y autoconocimiento');
      recommendations.push('Considera usar esta capacidad de reflexión para identificar patrones a lo largo del tiempo');
    }

    // Recomendaciones generales basadas en el texto
    if (insights.length === 0) {
      insights.push('Tu descripción personal proporciona contexto valioso sobre tu estado emocional actual');
      insights.push(`Basado en tu estado de ánimo (${moodValue}/5) y tus emociones (${emotionsText}), hay espacio para crecimiento personal`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Continúa escribiendo sobre tus sentimientos para desarrollar mayor autoconciencia emocional');
      recommendations.push('Considera revisar tus descripciones anteriores para identificar patrones y cambios a lo largo del tiempo');
    }

    return {
      title: 'Análisis de tu Reflexión Personal',
      description: `Basado en lo que escribiste sobre cómo te sientes, junto con tu estado de ánimo (${moodValue}/5) y las emociones que identificaste (${emotionsText}), aquí tienes insights personalizados:`,
      insights: insights.length > 0 ? insights : [
        'Tu reflexión personal muestra autoconciencia emocional',
        'La conexión entre tus pensamientos y emociones es importante para tu bienestar'
      ],
      recommendations: recommendations.length > 0 ? recommendations : [
        'Continúa explorando tus sentimientos a través de la escritura',
        'Considera mantener un registro de cómo tus pensamientos influyen en tus emociones'
      ]
    };
  }
}

export const aiService = new AIService();
