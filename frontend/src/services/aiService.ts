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
    return `
Analiza el siguiente estado de ánimo y proporciona recomendaciones profesionales:

DATOS DEL USUARIO:
- Estado de ánimo general: ${moodData.overallMood}/5
- Energía: ${moodData.energy}/10
- Estrés: ${moodData.stress}/10
- Calidad del sueño: ${moodData.sleep}/10
- Actividades realizadas: ${moodData.activities.join(', ')}
- Emociones identificadas: ${moodData.emotions.join(', ')}
- Descripción de sentimientos: "${moodData.feelings}"

Por favor proporciona:
1. Un resumen general del estado emocional
2. 3-5 insights clave sobre patrones observados
3. 4-6 recomendaciones específicas y accionables
4. Evaluación de tendencia (mejorando/estable/empeorando)
5. Nivel de riesgo (bajo/medio/alto)

Formato de respuesta en JSON:
{
  "summary": "resumen del estado emocional",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": [
    {
      "type": "energy|stress|sleep|mood|general",
      "priority": "high|medium|low",
      "title": "Título de la recomendación",
      "description": "Descripción detallada",
      "actionable": "Acción específica a tomar",
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

    return {
      summary: `Análisis personalizado basado en tu estado de ánimo (${moodData.overallMood.toFixed(1)}/5), energía (${moodData.energy.toFixed(1)}/10), estrés (${moodData.stress.toFixed(1)}/10) y sueño (${moodData.sleep.toFixed(1)}/10). ${moodData.feelings ? `Tus sentimientos: "${moodData.feelings}"` : ''}`,
      insights,
      recommendations: finalRecommendations,
      moodTrend: moodData.overallMood >= 4 ? 'improving' : moodData.overallMood <= 2 ? 'declining' : 'stable',
      riskLevel: moodData.overallMood <= 2 && moodData.stress > 7 ? 'high' : moodData.overallMood <= 3 ? 'medium' : 'low',
    };
  }
}

export const aiService = new AIService();
