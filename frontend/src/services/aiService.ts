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
        description: 'Tu estado de ánimo está bajo. Es importante buscar apoyo.',
        actionable: 'Considera hablar con un profesional de salud mental o un ser querido.',
        category: 'Salud Mental'
      });
    }

    if (moodData.energy < 5) {
      recommendations.push({
        type: 'energy',
        priority: 'medium',
        title: 'Aumentar Energía',
        description: 'Tu nivel de energía está bajo.',
        actionable: 'Intenta hacer ejercicio ligero, caminar o tomar una ducha refrescante.',
        category: 'Bienestar Físico'
      });
    }

    if (moodData.stress > 6) {
      recommendations.push({
        type: 'stress',
        priority: 'high',
        title: 'Manejo del Estrés',
        description: 'Tu nivel de estrés es alto.',
        actionable: 'Practica técnicas de relajación como respiración profunda o meditación.',
        category: 'Relajación'
      });
    }

    if (moodData.sleep < 5) {
      recommendations.push({
        type: 'sleep',
        priority: 'medium',
        title: 'Mejorar el Sueño',
        description: 'La calidad de tu sueño necesita atención.',
        actionable: 'Establece una rutina de sueño consistente y evita pantallas antes de dormir.',
        category: 'Hábitos Saludables'
      });
    }

    // Add general recommendations
    if (moodData.activities.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Actividades Positivas',
        description: 'No se registraron actividades específicas.',
        actionable: 'Intenta realizar al menos una actividad que disfrutes cada día.',
        category: 'Actividades'
      });
    }

    const insights = [
      `Estado de ánimo general: ${moodData.overallMood <= 2 ? 'Bajo' : moodData.overallMood >= 4 ? 'Alto' : 'Moderado'}`,
      `Nivel de energía: ${moodData.energy < 5 ? 'Bajo' : moodData.energy > 7 ? 'Alto' : 'Moderado'}`,
      `Estrés: ${moodData.stress > 6 ? 'Alto' : moodData.stress < 4 ? 'Bajo' : 'Moderado'}`,
    ];

    if (moodData.emotions.length > 0) {
      insights.push(`Emociones principales: ${moodData.emotions.slice(0, 3).join(', ')}`);
    }

    return {
      summary: `Análisis basado en tu estado de ánimo (${moodData.overallMood}/5), energía (${moodData.energy}/10), estrés (${moodData.stress}/10) y sueño (${moodData.sleep}/10).`,
      insights,
      recommendations,
      moodTrend: moodData.overallMood >= 4 ? 'improving' : moodData.overallMood <= 2 ? 'declining' : 'stable',
      riskLevel: moodData.overallMood <= 2 && moodData.stress > 7 ? 'high' : moodData.overallMood <= 3 ? 'medium' : 'low',
    };
  }
}

export const aiService = new AIService();
