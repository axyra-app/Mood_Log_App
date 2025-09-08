// OpenAI Service para análisis de IA real
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback service for when OpenAI is not available
const FALLBACK_MODE = !OPENAI_API_KEY || OPENAI_API_KEY === '';

export interface MoodLog {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  date: string;
  notes: string;
  activities?: string[];
  weather?: string;
}

export interface AIAnalysis {
  summary: string;
  trends: string[];
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  positivePatterns: string[];
}

export class OpenAIService {
  private static async makeRequest(prompt: string): Promise<string> {
    // If no API key, use fallback
    if (FALLBACK_MODE) {
      return this.getFallbackResponse(prompt);
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Eres un psicólogo experto en análisis de estados de ánimo. Analiza los datos proporcionados y da insights profesionales, recomendaciones y patrones. Responde en español.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No se pudo generar el análisis';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Fallback to local analysis
      return this.getFallbackResponse(prompt);
    }
  }

  private static getFallbackResponse(prompt: string): string {
    // Simple keyword-based analysis as fallback
    const text = prompt.toLowerCase();
    
    const positiveKeywords = [
      'bien', 'feliz', 'contento', 'genial', 'excelente', 'maravilloso', 
      'perfecto', 'increíble', 'fantástico', 'alegre', 'optimista', 
      'motivado', 'energético', 'satisfecho', 'orgulloso', 'agradecido'
    ];
    
    const negativeKeywords = [
      'mal', 'triste', 'deprimido', 'ansioso', 'preocupado', 'estresado',
      'cansado', 'frustrado', 'enojado', 'molesto', 'desanimado', 'solo',
      'vacío', 'perdido', 'confundido', 'asustado'
    ];

    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;

    if (positiveCount > negativeCount) {
      return JSON.stringify({
        summary: "Tu estado de ánimo parece positivo. Has mencionado varios aspectos positivos en tu día.",
        trends: ["Tendencia positiva en el estado de ánimo", "Mayor satisfacción general"],
        insights: ["Te sientes motivado y energético", "Tienes una perspectiva optimista"],
        recommendations: ["Mantén estas actividades positivas", "Comparte tu energía con otros"],
        riskFactors: [],
        positivePatterns: ["Actitud positiva", "Energía alta", "Satisfacción general"]
      });
    } else if (negativeCount > positiveCount) {
      return JSON.stringify({
        summary: "Has experimentado algunas dificultades recientemente. Es normal tener días difíciles.",
        trends: ["Disminución en el estado de ánimo", "Mayor estrés o preocupación"],
        insights: ["Puedes estar pasando por un momento difícil", "Es importante buscar apoyo"],
        recommendations: ["Considera hablar con alguien de confianza", "Practica técnicas de relajación", "Mantén una rutina saludable"],
        riskFactors: ["Posible estrés elevado", "Necesidad de apoyo emocional"],
        positivePatterns: ["Reconocimiento de las dificultades", "Búsqueda de ayuda"]
      });
    } else {
      return JSON.stringify({
        summary: "Tu estado de ánimo se mantiene estable. No hay cambios significativos detectados.",
        trends: ["Estado de ánimo estable", "Sin cambios drásticos"],
        insights: ["Mantienes un equilibrio emocional", "Tu bienestar es consistente"],
        recommendations: ["Continúa con tus hábitos actuales", "Considera agregar nuevas actividades"],
        riskFactors: [],
        positivePatterns: ["Estabilidad emocional", "Consistencia en el bienestar"]
      });
    }
  }

  static async analyzeMoodTrends(moodLogs: MoodLog[]): Promise<AIAnalysis> {
    if (moodLogs.length === 0) {
      return {
        summary: 'No hay suficientes datos para realizar un análisis.',
        trends: [],
        insights: [],
        recommendations: ['Comienza a registrar tu estado de ánimo diariamente para obtener insights personalizados.'],
        riskFactors: [],
        positivePatterns: [],
      };
    }

    // Preparar datos para el análisis
    const recentLogs = moodLogs.slice(-30); // Últimos 30 días
    const moodData = recentLogs.map((log) => ({
      fecha: log.date,
      mood: log.mood,
      energia: log.energy,
      estres: log.stress,
      sueño: log.sleep,
      notas: log.notes,
      actividades: log.activities || [],
    }));

    const prompt = `
Analiza los siguientes datos de estado de ánimo de un usuario y proporciona un análisis completo:

Datos de los últimos ${recentLogs.length} días:
${JSON.stringify(moodData, null, 2)}

Por favor, proporciona un análisis estructurado que incluya:

1. RESUMEN: Un resumen general del estado emocional del usuario
2. TENDENCIAS: Principales tendencias observadas (mood, energía, estrés, sueño)
3. INSIGHTS: Observaciones profundas sobre patrones y correlaciones
4. RECOMENDACIONES: Sugerencias específicas y accionables
5. FACTORES DE RIESGO: Señales de alerta o patrones preocupantes
6. PATRONES POSITIVOS: Aspectos positivos y fortalezas identificadas

Responde en formato JSON con las siguientes claves:
{
  "summary": "resumen aquí",
  "trends": ["tendencia 1", "tendencia 2"],
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "riskFactors": ["factor 1", "factor 2"],
  "positivePatterns": ["patrón 1", "patrón 2"]
}
`;

    try {
      const response = await this.makeRequest(prompt);

      // Intentar parsear la respuesta JSON
      try {
        const parsedResponse = JSON.parse(response);
        return {
          summary: parsedResponse.summary || 'Análisis completado',
          trends: parsedResponse.trends || [],
          insights: parsedResponse.insights || [],
          recommendations: parsedResponse.recommendations || [],
          riskFactors: parsedResponse.riskFactors || [],
          positivePatterns: parsedResponse.positivePatterns || [],
        };
      } catch (parseError) {
        // Si no es JSON válido, crear un análisis básico
        return {
          summary: response.substring(0, 200) + '...',
          trends: ['Análisis de tendencias disponible'],
          insights: ['Insights generados por IA'],
          recommendations: ['Recomendaciones personalizadas'],
          riskFactors: [],
          positivePatterns: ['Patrones positivos identificados'],
        };
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      return {
        summary: 'Error al generar el análisis. Por favor, intenta de nuevo.',
        trends: [],
        insights: [],
        recommendations: ['Verifica tu conexión a internet e intenta de nuevo.'],
        riskFactors: [],
        positivePatterns: [],
      };
    }
  }

  static async generateInsight(moodLog: MoodLog): Promise<string> {
    const prompt = `
Analiza este registro de estado de ánimo y proporciona un insight personalizado:

Fecha: ${moodLog.date}
Mood: ${moodLog.mood}/10
Energía: ${moodLog.energy}/10
Estrés: ${moodLog.stress}/10
Sueño: ${moodLog.sleep}/10
Notas: ${moodLog.notes}
Actividades: ${moodLog.activities?.join(', ') || 'No especificadas'}

Proporciona un insight breve y útil sobre este día específico.
`;

    try {
      return await this.makeRequest(prompt);
    } catch (error) {
      console.error('Error generating insight:', error);
      return 'No se pudo generar el insight en este momento.';
    }
  }

  static async getRecommendations(moodLogs: MoodLog[]): Promise<string[]> {
    if (moodLogs.length < 3) {
      return [
        'Registra más datos para obtener recomendaciones personalizadas',
        'Mantén un registro consistente de tu estado de ánimo',
        'Incluye notas detalladas sobre tus actividades y emociones',
      ];
    }

    const recentMoods = moodLogs.slice(-7).map((log) => log.mood);
    const avgMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;

    const prompt = `
Basándote en estos datos recientes de estado de ánimo (últimos 7 días):
Promedio de mood: ${avgMood.toFixed(1)}/10
Datos: ${JSON.stringify(recentMoods)}

Proporciona 3-5 recomendaciones específicas y accionables para mejorar el bienestar emocional.
Responde como una lista simple, una recomendación por línea.
`;

    try {
      const response = await this.makeRequest(prompt);
      return response.split('\n').filter((line) => line.trim().length > 0);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [
        'Mantén un horario de sueño regular',
        'Practica actividades que disfrutes',
        'Considera hablar con un profesional si persisten los bajos estados de ánimo',
      ];
    }
  }

  // New method for real-time mood analysis from diary text
  static async analyzeDiaryText(diaryText: string): Promise<{
    emotion: string;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    canConclude: boolean;
    moodScore?: number;
  }> {
    const prompt = `
Analiza el siguiente texto de diario y determina:
1. La emoción principal
2. El nivel de confianza (0-100)
3. El sentimiento general (positive/negative/neutral)
4. Si se puede concluir un estado de ánimo (true/false)
5. Un puntaje de estado de ánimo (1-5) si es posible

Texto: "${diaryText}"

Responde en formato JSON:
{
  "emotion": "emoción principal",
  "confidence": número_0_a_100,
  "sentiment": "positive/negative/neutral",
  "canConclude": true/false,
  "moodScore": número_1_a_5_o_null
}
`;

    try {
      const response = await this.makeRequest(prompt);
      const parsed = JSON.parse(response);
      
      return {
        emotion: parsed.emotion || 'Neutral',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        sentiment: parsed.sentiment || 'neutral',
        canConclude: parsed.canConclude || false,
        moodScore: parsed.moodScore || undefined
      };
    } catch (error) {
      console.error('Error analyzing diary text:', error);
      // Fallback analysis
      return this.getFallbackDiaryAnalysis(diaryText);
    }
  }

  private static getFallbackDiaryAnalysis(diaryText: string): {
    emotion: string;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    canConclude: boolean;
    moodScore?: number;
  } {
    const text = diaryText.toLowerCase();
    
    const positiveKeywords = [
      'bien', 'feliz', 'contento', 'genial', 'excelente', 'maravilloso',
      'perfecto', 'increíble', 'fantástico', 'alegre', 'optimista',
      'motivado', 'energético', 'satisfecho', 'orgulloso', 'agradecido'
    ];
    
    const negativeKeywords = [
      'mal', 'triste', 'deprimido', 'ansioso', 'preocupado', 'estresado',
      'cansado', 'frustrado', 'enojado', 'molesto', 'desanimado', 'solo',
      'vacío', 'perdido', 'confundido', 'asustado'
    ];

    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;
    const totalKeywords = positiveCount + negativeCount;

    let sentiment: 'positive' | 'negative' | 'neutral';
    let emotion: string;
    let moodScore: number | undefined;

    if (positiveCount > negativeCount && positiveCount > 0) {
      sentiment = 'positive';
      emotion = positiveCount >= 3 ? 'Felicidad' : 'Tranquilidad';
      moodScore = positiveCount >= 3 ? 5 : 4;
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      sentiment = 'negative';
      emotion = negativeCount >= 3 ? 'Tristeza' : 'Ansiedad';
      moodScore = negativeCount >= 3 ? 1 : 2;
    } else {
      sentiment = 'neutral';
      emotion = 'Calma';
      moodScore = 3;
    }

    const confidence = Math.min(95, Math.max(40, 40 + totalKeywords * 8));
    const canConclude = confidence >= 70 && totalKeywords >= 2;

    return {
      emotion,
      confidence,
      sentiment,
      canConclude,
      moodScore: canConclude ? moodScore : undefined
    };
  }
}

export default OpenAIService;
