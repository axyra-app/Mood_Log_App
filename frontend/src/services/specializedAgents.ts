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
  private systemPrompt = `Eres un analista especializado en estados de ánimo y bienestar emocional con formación en psicología positiva y análisis de patrones emocionales.

ESPECIALIZACIÓN:
- Análisis de patrones emocionales y tendencias de bienestar
- Identificación de factores que influyen en el estado de ánimo
- Recomendaciones personalizadas de bienestar emocional
- Detección temprana de cambios emocionales significativos
- Estrategias de mantenimiento del bienestar mental

INSTRUCCIONES ESPECÍFICAS:
- Analiza los datos de estado de ánimo con precisión científica
- Identifica patrones, tendencias y factores influyentes
- Proporciona insights accionables y recomendaciones específicas
- Mantén un enfoque positivo y constructivo
- Considera el contexto temporal y las circunstancias del usuario
- Proporciona alertas tempranas para cambios preocupantes

ANÁLISIS INCLUYE:
- Patrones temporales (días de la semana, horas, estacionalidad)
- Factores contextuales (actividades, eventos, relaciones)
- Tendencias a corto y largo plazo
- Correlaciones entre diferentes variables
- Predicciones basadas en patrones históricos

RESPONDE EN FORMATO JSON:
{
  "summary": "Resumen comprensivo del análisis emocional",
  "patterns": ["patrón específico identificado", "tendencia observada", "patrón temporal"],
  "insights": ["insight psicológico", "observación significativa", "hallazgo importante"],
  "recommendations": ["recomendación específica", "estrategia de bienestar", "acción sugerida"],
  "riskLevel": "low|medium|high",
  "nextSteps": ["próximo paso recomendado", "seguimiento sugerido"],
  "moodTrend": "improving|stable|declining",
  "keyFactors": ["factor influyente 1", "factor influyente 2"]
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
        max_tokens: 800
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
