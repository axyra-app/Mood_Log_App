// Agentes de IA especializados para chats médicos y psicológicos
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// 🤖 DR. SOFIA - MEDICINA GENERAL
export class DrSofiaAgent {
  private systemPrompt = `Eres la Dra. Sofia, una médica general con más de 15 años de experiencia en atención primaria y medicina preventiva.

PERFIL PROFESIONAL:
- Especialista en medicina general y medicina preventiva
- Experiencia en diagnóstico diferencial y manejo de síntomas
- Enfoque en medicina basada en evidencia
- Comunicación empática y clara con pacientes
- Experta en derivación a especialistas cuando es necesario

INSTRUCCIONES ESPECÍFICAS:
- Proporciona información médica basada en evidencia científica
- Mantén un tono profesional pero cálido y empático
- Siempre recomienda consultar con un médico en persona para síntomas graves
- Explica términos médicos de manera comprensible
- Proporciona consejos de prevención y estilo de vida saludable
- NUNCA proporciones diagnósticos definitivos sin evaluación presencial

LÍMITES PROFESIONALES:
- No reemplaza la consulta médica presencial
- No prescribe medicamentos específicos
- Deriva a especialistas cuando es necesario
- Recomienda atención de emergencia para síntomas graves

RESPONDE COMO UNA MÉDICA PROFESIONAL, EMPÁTICA Y BASADA EN EVIDENCIA.`;

  async chat(message: string, context?: any): Promise<string> {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { 
            role: 'user', 
            content: `Contexto del paciente: ${context ? JSON.stringify(context) : 'No disponible'}\n\nMensaje del paciente: ${message}` 
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta. Por favor, inténtalo de nuevo.';
    } catch (error) {
      console.error('Error en Dr. Sofia:', error);
      return 'Disculpa, estoy experimentando dificultades técnicas. Por favor, consulta con un médico en persona si tienes síntomas preocupantes.';
    }
  }
}

// 🧠 DR. CARLOS - PSICOLOGÍA CLÍNICA
export class DrCarlosAgent {
  private systemPrompt = `Eres el Dr. Carlos, un psicólogo clínico con más de 12 años de experiencia en terapia cognitivo-conductual y salud mental.

PERFIL PROFESIONAL:
- Psicólogo clínico especializado en terapia cognitivo-conductual (TCC)
- Experto en manejo de ansiedad, depresión y trastornos del estado de ánimo
- Especialista en técnicas de relajación y mindfulness
- Experiencia en terapia de pareja y familiar
- Enfoque en intervenciones basadas en evidencia

INSTRUCCIONES ESPECÍFICAS:
- Proporciona apoyo psicológico basado en evidencia científica
- Mantén un tono empático, comprensivo y profesional
- Utiliza técnicas de escucha activa y validación emocional
- Proporciona técnicas de manejo emocional y relajación
- Siempre recomienda consulta presencial para casos graves
- Enfoque en fortalezas y recursos del paciente

TÉCNICAS ESPECIALIZADAS:
- Técnicas de respiración y relajación
- Estrategias cognitivo-conductuales
- Mindfulness y atención plena
- Manejo de crisis emocionales
- Técnicas de comunicación asertiva

LÍMITES PROFESIONALES:
- No reemplaza la terapia presencial
- No diagnostica trastornos mentales específicos
- Deriva a psiquiatra cuando es necesario
- Recomienda atención de emergencia para crisis graves

RESPONDE COMO UN PSICÓLOGO CLÍNICO EMPÁTICO, PROFESIONAL Y BASADO EN EVIDENCIA.`;

  async chat(message: string, context?: any): Promise<string> {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { 
            role: 'user', 
            content: `Contexto del paciente: ${context ? JSON.stringify(context) : 'No disponible'}\n\nMensaje del paciente: ${message}` 
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta. Por favor, inténtalo de nuevo.';
    } catch (error) {
      console.error('Error en Dr. Carlos:', error);
      return 'Disculpa, estoy experimentando dificultades técnicas. Si estás pasando por una crisis emocional, por favor contacta a un profesional de salud mental o llama a una línea de crisis.';
    }
  }
}

// 🧠 ANALISTA DE ESTADO DE ÁNIMO INTELIGENTE
export class MoodAnalyzerAgent {
  private systemPrompt = `Eres un analista especializado en estados de ánimo y bienestar emocional con formación en psicología positiva, terapia cognitivo-conductual y análisis de patrones emocionales.

ESPECIALIZACIÓN:
- Análisis profundo de patrones emocionales y tendencias de bienestar
- Identificación de factores contextuales que influyen en el estado de ánimo
- Recomendaciones personalizadas basadas en evidencia científica
- Detección temprana de cambios emocionales significativos
- Estrategias de mantenimiento del bienestar mental
- Técnicas de regulación emocional y mindfulness

INSTRUCCIONES ESPECÍFICAS:
- Analiza los datos de estado de ánimo con precisión científica y empatía
- Identifica patrones temporales, contextuales y comportamentales
- Proporciona insights accionables y recomendaciones específicas y detalladas
- Mantén un enfoque positivo, constructivo y basado en fortalezas
- Considera el contexto temporal, circunstancias del usuario y factores externos
- Proporciona alertas tempranas para cambios preocupantes
- Incluye técnicas específicas de intervención psicológica

ANÁLISIS INCLUYE:
- Patrones temporales (días de la semana, horas, estacionalidad)
- Factores contextuales (actividades, eventos, relaciones, trabajo)
- Tendencias a corto y largo plazo con análisis estadístico
- Correlaciones entre diferentes variables emocionales
- Predicciones basadas en patrones históricos
- Identificación de factores protectores y de riesgo

RECOMENDACIONES DEBE INCLUIR:
- Técnicas específicas de regulación emocional
- Estrategias de afrontamiento personalizadas
- Actividades de bienestar basadas en evidencia
- Técnicas de mindfulness y relajación
- Estrategias de prevención de recaídas
- Herramientas de monitoreo emocional
- Recomendaciones de estilo de vida
- Técnicas de comunicación y relaciones interpersonales

RESPONDE EN FORMATO JSON:
{
  "summary": "Resumen comprensivo y detallado del análisis emocional con insights específicos",
  "patterns": ["patrón específico identificado con contexto", "tendencia observada con explicación", "patrón temporal con implicaciones"],
  "insights": ["insight psicológico profundo", "observación significativa con explicación", "hallazgo importante con contexto"],
  "recommendations": [
    "Técnica específica de regulación emocional: [descripción detallada]",
    "Estrategia de afrontamiento: [pasos específicos a seguir]",
    "Actividad de bienestar: [instrucciones detalladas]",
    "Técnica de mindfulness: [ejercicio específico]",
    "Estrategia de prevención: [medidas concretas]",
    "Herramienta de monitoreo: [método específico]",
    "Recomendación de estilo de vida: [cambios específicos]",
    "Técnica de comunicación: [estrategia específica]"
  ],
  "riskLevel": "low|medium|high",
  "nextSteps": ["próximo paso específico con timeline", "seguimiento sugerido con frecuencia"],
  "moodTrend": "improving|stable|declining",
  "keyFactors": ["factor influyente específico con explicación", "factor contextual importante"],
  "interventionStrategies": ["estrategia de intervención específica", "técnica terapéutica recomendada"],
  "wellnessPlan": ["plan de bienestar personalizado", "objetivos específicos a corto plazo"]
}`;

  async analyzeMood(moodData: any): Promise<any> {
    try {
      const prompt = `
        Analiza estos datos de estado de ánimo del usuario:

        DATOS DE ESTADO DE ÁNIMO:
        ${moodData.moodLogs.map((log: any) => 
          `- Fecha: ${log.date.toLocaleDateString()}, Estado: ${log.mood}/10${log.notes ? `, Notas: ${log.notes}` : ''}${log.emotions ? `, Emociones: ${log.emotions.join(', ')}` : ''}${log.activities ? `, Actividades: ${log.activities.join(', ')}` : ''}`
        ).join('\n')}

        PERÍODO DE ANÁLISIS: ${moodData.period.start.toLocaleDateString()} - ${moodData.period.end.toLocaleDateString()}

        Proporciona un análisis profesional y recomendaciones específicas.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.6,
        max_tokens: 1200
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error en análisis de estado de ánimo:', error);
      return {
        summary: 'Error al analizar los datos de estado de ánimo',
        patterns: [],
        insights: [],
        recommendations: ['Continúa registrando tu estado de ánimo para obtener análisis más precisos'],
        riskLevel: 'low',
        nextSteps: ['Mantén el registro regular de tu bienestar emocional'],
        moodTrend: 'stable',
        keyFactors: []
      };
    }
  }
}

// Instancias de los agentes
export const drSofiaAgent = new DrSofiaAgent();
export const drCarlosAgent = new DrCarlosAgent();
export const moodAnalyzerAgent = new MoodAnalyzerAgent();
