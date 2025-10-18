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
    
    // Generate recommendations based on mood data
    if (moodData.overallMood <= 2) {
      recommendations.push({
        type: 'mood',
        priority: 'high',
        title: 'Apoyo Emocional',
        description: 'Tu estado de ánimo está bajo. Es importante buscar apoyo emocional.',
        actionable: 'Considera hablar con un profesional de salud mental, un ser querido o usar técnicas de relajación.',
        category: 'Salud Mental'
      });
      
      recommendations.push({
        type: 'general',
        priority: 'high',
        title: 'Actividades de Bienestar',
        description: 'Realiza actividades que te generen placer y satisfacción.',
        actionable: 'Dedica tiempo a hobbies, música relajante, o actividades creativas que disfrutes.',
        category: 'Autocuidado'
      });
    }

    if (moodData.energy < 5) {
      recommendations.push({
        type: 'energy',
        priority: 'medium',
        title: 'Aumentar Energía',
        description: 'Tu nivel de energía está bajo. Es importante reactivarte gradualmente.',
        actionable: 'Intenta hacer ejercicio ligero (caminar 10-15 min), tomar una ducha refrescante, o exponerte a luz natural.',
        category: 'Bienestar Físico'
      });
    }

    if (moodData.stress > 6) {
      recommendations.push({
        type: 'stress',
        priority: 'high',
        title: 'Manejo del Estrés',
        description: 'Tu nivel de estrés es alto. Es importante implementar técnicas de relajación.',
        actionable: 'Practica respiración profunda (4-7-8), meditación de 5 minutos, o técnicas de relajación muscular.',
        category: 'Relajación'
      });
      
      recommendations.push({
        type: 'stress',
        priority: 'medium',
        title: 'Organización y Planificación',
        description: 'El estrés puede reducirse con mejor organización.',
        actionable: 'Haz una lista de tareas prioritarias y toma descansos regulares entre actividades.',
        category: 'Productividad'
      });
    }

    if (moodData.sleep < 5) {
      recommendations.push({
        type: 'sleep',
        priority: 'medium',
        title: 'Mejorar la Calidad del Sueño',
        description: 'La calidad de tu sueño necesita atención para tu bienestar general.',
        actionable: 'Establece una rutina de sueño consistente, evita pantallas 1 hora antes de dormir, y crea un ambiente relajante.',
        category: 'Hábitos Saludables'
      });
    }

    // Add general recommendations based on activities and emotions
    if (moodData.activities.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Actividades Positivas',
        description: 'No se registraron actividades específicas hoy.',
        actionable: 'Intenta realizar al menos una actividad que disfrutes: leer, cocinar, escuchar música, o hacer ejercicio ligero.',
        category: 'Actividades'
      });
    }

    if (moodData.emotions.length > 0) {
      const negativeEmotions = moodData.emotions.filter(emotion => 
        ['tristeza', 'ansiedad', 'preocupación', 'ira', 'frustración', 'miedo'].includes(emotion.toLowerCase())
      );
      
      if (negativeEmotions.length > 0) {
        recommendations.push({
          type: 'mood',
          priority: 'medium',
          title: 'Manejo de Emociones Difíciles',
          description: `Identificaste emociones como: ${negativeEmotions.join(', ')}.`,
          actionable: 'Practica técnicas de mindfulness, escribe sobre tus sentimientos, o habla con alguien de confianza.',
          category: 'Regulación Emocional'
        });
      }
    }

    // Add positive reinforcement recommendations
    if (moodData.overallMood >= 4) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Mantener el Bienestar',
        description: 'Tu estado de ánimo es positivo. Continúa con las actividades que te hacen sentir bien.',
        actionable: 'Mantén tus rutinas saludables y considera ayudar a otros o practicar gratitud.',
        category: 'Mantenimiento'
      });
    }

    // Ensure we always have at least 3 recommendations
    if (recommendations.length < 3) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Hidratación y Nutrición',
        description: 'El bienestar físico impacta directamente en el estado de ánimo.',
        actionable: 'Asegúrate de beber suficiente agua y tener comidas balanceadas durante el día.',
        category: 'Salud Física'
      });
      
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Conexión Social',
        description: 'Las conexiones sociales son fundamentales para el bienestar emocional.',
        actionable: 'Intenta conectar con familiares, amigos, o participar en actividades sociales que disfrutes.',
        category: 'Relaciones'
      });
    }

    const insights = [
      `Estado de ánimo general: ${moodData.overallMood <= 2 ? 'Bajo - Necesita atención' : moodData.overallMood >= 4 ? 'Alto - Excelente' : 'Moderado - Estable'}`,
      `Nivel de energía: ${moodData.energy < 5 ? 'Bajo - Considera actividades energizantes' : moodData.energy > 7 ? 'Alto - Mantén el ritmo' : 'Moderado - Equilibrado'}`,
      `Estrés: ${moodData.stress > 6 ? 'Alto - Implementa técnicas de relajación' : moodData.stress < 4 ? 'Bajo - Excelente manejo' : 'Moderado - Monitorea'}`,
    ];

    if (moodData.emotions.length > 0) {
      insights.push(`Emociones principales: ${moodData.emotions.slice(0, 3).join(', ')}`);
    }

    if (moodData.activities.length > 0) {
      insights.push(`Actividades realizadas: ${moodData.activities.slice(0, 3).join(', ')}`);
    }

    return {
      summary: `Análisis personalizado basado en tu estado de ánimo (${moodData.overallMood}/5), energía (${moodData.energy}/10), estrés (${moodData.stress}/10) y sueño (${moodData.sleep}/10). ${moodData.feelings ? `Tus sentimientos: "${moodData.feelings}"` : ''}`,
      insights,
      recommendations,
      moodTrend: moodData.overallMood >= 4 ? 'improving' : moodData.overallMood <= 2 ? 'declining' : 'stable',
      riskLevel: moodData.overallMood <= 2 && moodData.stress > 7 ? 'high' : moodData.overallMood <= 3 ? 'medium' : 'low',
    };
  }
}

export const aiService = new AIService();
