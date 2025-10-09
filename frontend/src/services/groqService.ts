import { Groq } from 'groq-sdk';

// Configuración de Groq
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true, // Solo para desarrollo, en producción usar backend
});

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Función para generar respuesta de IA usando Groq
export const generateAIResponse = async (
  messages: GroqChatMessage[],
  context?: {
    userMood?: string;
    userHistory?: string[];
    isCrisis?: boolean;
  }
): Promise<GroqChatResponse> => {
  try {
    // Verificar si la API key está disponible
    if (!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'demo-key') {
      throw new Error('Groq API key not configured');
    }

    // Preparar el prompt del sistema
    const systemPrompt = `Eres un asistente de salud mental especializado en apoyo emocional. Tu objetivo es:

1. **Escuchar activamente** y mostrar empatía genuina
2. **Proporcionar apoyo emocional** sin dar consejos médicos específicos
3. **Ser comprensivo** y no juzgar
4. **Sugerir recursos** cuando sea apropiado
5. **Detectar señales de crisis** y recomendar ayuda profesional

${context?.isCrisis ? `
⚠️ **ALERTA DE CRISIS**: El usuario muestra señales de crisis. 
- Mantén la calma y muestra apoyo
- NO minimices sus sentimientos
- Recomienda contactar ayuda profesional inmediatamente
- Proporciona números de emergencia si es necesario
` : ''}

${context?.userMood ? `Estado de ánimo actual del usuario: ${context.userMood}` : ''}

Instrucciones:
- Responde en español
- Sé cálido pero profesional
- Mantén respuestas concisas (máximo 200 palabras)
- Si detectas crisis, recomienda ayuda profesional inmediatamente
- NO diagnostiques ni prescribas medicamentos
- Enfócate en apoyo emocional y técnicas de bienestar`;

    // Preparar mensajes para Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Generar respuesta usando Groq
    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant', // Modelo rápido y eficiente de Groq
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta en este momento.';

    return {
      content: response,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined
    };

  } catch (error) {
    console.error('Error generating Groq response:', error);
    
    // Respuesta de fallback
    const fallbackResponses = [
      'Entiendo que estás pasando por un momento difícil. ¿Te gustaría hablar más sobre cómo te sientes?',
      'Estoy aquí para escucharte. ¿Qué es lo que más te preocupa en este momento?',
      'Me parece que necesitas apoyo. ¿Has considerado hablar con un profesional de la salud mental?',
      'Entiendo tus sentimientos. ¿Te gustaría que exploremos algunas técnicas de relajación juntos?',
      'Estoy aquí para ayudarte. ¿Qué te gustaría hacer para sentirte mejor?'
    ];

    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    };
  }
};

// Función para análisis de crisis usando Groq
export const analyzeCrisisSignals = async (
  message: string,
  moodHistory?: string[]
): Promise<{
  isCrisis: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  signals: string[];
  recommendations: string[];
}> => {
  try {
    const systemPrompt = `Eres un experto en detección de crisis de salud mental. Analiza el siguiente mensaje y determina:

1. Si hay señales de crisis (pensamientos suicidas, autolesión, etc.)
2. El nivel de riesgo (bajo, medio, alto)
3. Las señales específicas encontradas
4. Recomendaciones apropiadas

Responde SOLO en formato JSON válido:
{
  "isCrisis": boolean,
  "riskLevel": "low" | "medium" | "high",
  "signals": ["señal1", "señal2"],
  "recommendations": ["recomendación1", "recomendación2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Mensaje a analizar: "${message}"${moodHistory ? `\n\nHistorial de estados de ánimo: ${moodHistory.join(', ')}` : ''}` 
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback si no se puede parsear JSON
      return {
        isCrisis: message.toLowerCase().includes('suicidio') || 
                 message.toLowerCase().includes('matar') || 
                 message.toLowerCase().includes('morir'),
        riskLevel: 'medium' as const,
        signals: ['Análisis automático no disponible'],
        recommendations: ['Recomendamos contactar un profesional de la salud mental']
      };
    }

  } catch (error) {
    console.error('Error analyzing crisis signals:', error);
    return {
      isCrisis: false,
      riskLevel: 'low' as const,
      signals: [],
      recommendations: ['Error en el análisis. Contacta un profesional si necesitas ayuda.']
    };
  }
};

// Función para análisis de diario usando Groq
export const analyzeJournalEntry = async (
  entry: string,
  mood?: string
): Promise<{
  insights: string[];
  patterns: string[];
  recommendations: string[];
  emotionalTone: 'positive' | 'neutral' | 'negative';
}> => {
  try {
    const systemPrompt = `Eres un psicólogo especializado en análisis de diarios personales. Analiza la siguiente entrada de diario y proporciona:

1. Insights sobre el estado emocional
2. Patrones identificados
3. Recomendaciones para el bienestar
4. Tono emocional general

Responde SOLO en formato JSON válido:
{
  "insights": ["insight1", "insight2"],
  "patterns": ["patrón1", "patrón2"],
  "recommendations": ["recomendación1", "recomendación2"],
  "emotionalTone": "positive" | "neutral" | "negative"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Entrada de diario: "${entry}"${mood ? `\nEstado de ánimo: ${mood}` : ''}` 
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        insights: ['Análisis no disponible'],
        patterns: ['Patrones no identificados'],
        recommendations: ['Continúa escribiendo en tu diario'],
        emotionalTone: 'neutral' as const
      };
    }

  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    return {
      insights: ['Error en el análisis'],
      patterns: [],
      recommendations: ['Continúa con tu rutina de bienestar'],
      emotionalTone: 'neutral' as const
    };
  }
};

export default groq;
