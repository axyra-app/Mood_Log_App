import OpenAI from 'openai';
import { getOpenAIConfig } from '../config/production';

const config = getOpenAIConfig();
const openai = new OpenAI({
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true, // Solo para desarrollo, en producción usar backend
});

export interface MoodAnalysis {
  primaryEmotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions: string[];
  patterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
  emotionalState: string;
  recommendations: string[];
}

export const analyzeMoodWithAI = async (moodData: {
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  notes: string;
  activities: string[];
  emotions: string[];
}): Promise<MoodAnalysis> => {
  try {
    const prompt = `
Analiza el siguiente estado emocional de un usuario y proporciona un análisis detallado:

Datos del usuario:
- Estado de ánimo (1-5): ${moodData.mood}
- Nivel de energía (1-10): ${moodData.energy}
- Nivel de estrés (1-10): ${moodData.stress}
- Calidad del sueño (1-10): ${moodData.sleep}
- Notas: "${moodData.notes}"
- Actividades: ${moodData.activities.join(', ')}
- Emociones: ${moodData.emotions.join(', ')}

Proporciona un análisis en formato JSON con:
1. primaryEmotion: La emoción principal detectada
2. confidence: Nivel de confianza (0-100)
3. sentiment: "positive", "negative" o "neutral"
4. suggestions: 3 sugerencias específicas para mejorar el bienestar
5. patterns: 2 patrones identificados
6. riskLevel: "low", "medium" o "high" basado en el estado
7. emotionalState: Descripción del estado emocional actual
8. recommendations: 3 recomendaciones específicas

Responde SOLO con el JSON válido, sin texto adicional.
`;

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content:
            'Eres un psicólogo experto en análisis emocional. Analiza los datos del usuario y proporciona insights profesionales y útiles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parsear la respuesta JSON
    const analysis = JSON.parse(response) as MoodAnalysis;

    // Validar que la respuesta tenga la estructura correcta
    if (!analysis.primaryEmotion || !analysis.confidence || !analysis.sentiment) {
      throw new Error('Respuesta de OpenAI inválida');
    }

    return analysis;
  } catch (error) {
    console.error('Error en análisis de IA:', error);

    // Fallback en caso de error
    return {
      primaryEmotion: 'neutral',
      confidence: 60,
      sentiment: 'neutral',
      suggestions: [
        'Considera hacer ejercicio ligero',
        'Practica técnicas de respiración',
        'Conecta con amigos o familia',
      ],
      patterns: ['Estado emocional estable'],
      riskLevel: 'low',
      emotionalState: 'Estado emocional equilibrado',
      recommendations: ['Mantén una rutina regular', 'Practica mindfulness', 'Cuida tu sueño'],
    };
  }
};

export const generatePersonalizedInsights = async (moodHistory: any[], userPreferences: any): Promise<string[]> => {
  try {
    const prompt = `
Basándote en el historial de estados de ánimo del usuario, genera insights personalizados:

Historial reciente: ${JSON.stringify(moodHistory.slice(0, 7))}
Preferencias: ${JSON.stringify(userPreferences)}

Genera 3 insights específicos y útiles en formato JSON array de strings.
`;

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Eres un coach de bienestar emocional. Proporciona insights personalizados y motivadores.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
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
      'Considera mantener tus rutinas actuales',
      'Tu bienestar emocional está en buen camino',
    ];
  }
};
