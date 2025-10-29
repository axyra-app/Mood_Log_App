// Agentes de IA especializados para chats médicos y psicológicos
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// 🤖 DR. MIA - MEDICINA GENERAL
export class DrMiaAgent {
  private systemPrompt = `Eres la Dra. Mia, una médica general con más de 15 años de experiencia en atención primaria y medicina preventiva.

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
      console.error('Error en Dr. Mia:', error);
      return 'Disculpa, estoy experimentando dificultades técnicas. Por favor, consulta con un médico en persona si tienes síntomas preocupantes.';
    }
  }
}

// 🧠 DR. BRYAN - PSICOLOGÍA CLÍNICA
export class DrBryanAgent {
  private systemPrompt = `Eres el Dr. Bryan, un psicólogo clínico con más de 12 años de experiencia en terapia cognitivo-conductual y salud mental.

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
      console.error('Error en Dr. Bryan:', error);
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
      if (!moodData.moodLogs || moodData.moodLogs.length === 0) {
        return {
          summary: 'No hay suficientes datos de estado de ánimo para realizar un análisis completo. Se recomienda registrar más estados de ánimo para obtener insights más precisos.',
          patterns: ['Patrón: Datos insuficientes para identificar patrones específicos'],
          insights: ['Insight: Necesitas más registros para un análisis profundo'],
          recommendations: [
            'Registra tu estado de ánimo diariamente durante al menos una semana',
            'Incluye notas detalladas sobre tu día y emociones',
            'Mantén un registro consistente para identificar patrones'
          ],
          riskLevel: 'low',
          nextSteps: ['Continúa registrando tu estado de ánimo regularmente'],
          moodTrend: 'stable',
          keyFactors: ['Factor: Falta de datos suficientes para análisis']
        };
      }

      const timestamp = new Date().toISOString();
      const uniqueId = Math.random().toString(36).substring(7);
      
      const randomContext = [
        'análisis matutino', 'evaluación vespertina', 'revisión nocturna', 'sesión de reflexión',
        'momento de introspección', 'evaluación personal', 'análisis emocional', 'revisión de bienestar'
      ];
      
      const randomApproach = [
        'enfoque cognitivo-conductual', 'perspectiva humanista', 'abordaje sistémico', 'enfoque integrativo',
        'perspectiva psicodinámica', 'abordaje centrado en soluciones', 'enfoque mindfulness', 'perspectiva positiva'
      ];

      const prompt = `
        Eres un psicólogo clínico especializado en análisis de estados de ánimo. Realiza un ${randomContext[Math.floor(Math.random() * randomContext.length)]} con ${randomApproach[Math.floor(Math.random() * randomApproach.length)]}.

        DATOS ESPECÍFICOS DEL USUARIO:
        ${moodData.moodLogs.map((log: any, index: number) => 
          `Registro ${index + 1}: Fecha: ${log.date.toLocaleDateString()}, Estado: ${log.mood}/10${log.notes ? `, Notas: "${log.notes}"` : ''}${log.emotions ? `, Emociones: ${log.emotions.join(', ')}` : ''}${log.activities ? `, Actividades: ${log.activities.join(', ')}` : ''}`
        ).join('\n')}

        PERÍODO DE ANÁLISIS: ${moodData.period.start.toLocaleDateString()} - ${moodData.period.end.toLocaleDateString()}
        CONTEXTO ÚNICO: ${timestamp}
        SEMILLA DE PERSONALIZACIÓN: ${uniqueId}
        IDENTIFICADOR DE SESIÓN: ${Math.random().toString(36).substring(2, 15)}

        INSTRUCCIONES CRÍTICAS:
        - Proporciona análisis ÚNICO y personalizado basado en estos datos específicos
        - Evita respuestas genéricas o repetitivas - cada análisis debe ser diferente
        - Incluye detalles específicos del perfil emocional del usuario
        - Sé empático y profesional pero específico
        - Considera el contexto individual y único
        - Varía tu estilo de comunicación y enfoque terapéutico
        - Incluye observaciones únicas basadas en los patrones específicos

        RESPONDE EN FORMATO JSON:
        {
          "summary": "Resumen personalizado y específico del estado emocional único del usuario",
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
        }
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.9,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No se recibió respuesta del modelo de IA');
      }

      // Intentar parsear JSON
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (parseError) {
        // Si falla el parseo, crear análisis básico pero personalizado
        return this.createFallbackAnalysis(moodData);
      }
    } catch (error) {
      console.error('Error en análisis de estado de ánimo:', error);
      return this.createFallbackAnalysis(moodData);
    }
  }

  private createFallbackAnalysis(moodData: any): any {
    const avgMood = moodData.moodLogs.reduce((sum: number, log: any) => sum + log.mood, 0) / moodData.moodLogs.length;
    const moodRange = {
      min: Math.min(...moodData.moodLogs.map((log: any) => log.mood)),
      max: Math.max(...moodData.moodLogs.map((log: any) => log.mood))
    };
    
    const uniqueId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toLocaleString();
    
    return {
      summary: `Análisis personalizado del ${timestamp}: Tu estado de ánimo promedio es ${avgMood.toFixed(1)}/10 durante el período analizado. ${moodRange.max - moodRange.min > 5 ? 'Se observan fluctuaciones significativas en tu estado emocional.' : 'Tu estado emocional se mantiene relativamente estable.'}`,
      patterns: [
        `Patrón de variabilidad: ${moodRange.max - moodRange.min > 5 ? 'Alta variabilidad emocional detectada' : 'Estabilidad emocional mantenida'}`,
        `Tendencia temporal: ${avgMood >= 7 ? 'Estado emocional positivo general' : avgMood >= 5 ? 'Estado emocional moderado' : 'Estado emocional que requiere atención'}`,
        `Rango emocional: ${moodRange.min}/10 a ${moodRange.max}/10 (variación de ${moodRange.max - moodRange.min} puntos)`
      ],
      insights: [
        `Insight clave: Tu estado de ánimo promedio de ${avgMood.toFixed(1)}/10 indica ${avgMood >= 7 ? 'un bienestar emocional positivo' : avgMood >= 5 ? 'un estado emocional moderado que puede mejorarse' : 'la necesidad de atención emocional'}`,
        `Observación importante: ${moodData.moodLogs.length} registros analizados proporcionan una base sólida para el análisis`,
        `Factor contextual: ${moodRange.max - moodRange.min > 5 ? 'Las fluctuaciones emocionales sugieren la necesidad de estrategias de regulación' : 'La estabilidad emocional es una fortaleza a mantener'}`
      ],
      recommendations: [
        `Técnica de regulación emocional personalizada: ${avgMood < 5 ? 'Practica la respiración 4-7-8 durante episodios de bajo estado de ánimo' : 'Mantén tu rutina actual que te está funcionando bien'}`,
        `Estrategia de afrontamiento específica: ${moodRange.max - moodRange.min > 5 ? 'Identifica los desencadenantes de tus fluctuaciones emocionales' : 'Continúa con las actividades que mantienen tu estabilidad'}`,
        `Actividad de bienestar personalizada: ${avgMood >= 7 ? 'Comparte tu energía positiva con otros' : 'Incorpora actividades que te generen placer y satisfacción'}`,
        `Técnica de mindfulness adaptada: Practica la atención plena durante ${avgMood < 5 ? '10-15 minutos diarios' : '5-10 minutos diarios'} para mantener el equilibrio emocional`,
        `Herramienta de monitoreo específica: Registra tu estado de ánimo ${avgMood < 5 ? 'dos veces al día' : 'una vez al día'} para mantener el seguimiento`,
        `Recomendación de estilo de vida: ${avgMood >= 7 ? 'Mantén tu rutina actual y considera ayudar a otros' : 'Establece pequeñas metas diarias para mejorar tu bienestar'}`
      ],
      riskLevel: avgMood < 3 ? 'high' : avgMood < 5 ? 'medium' : 'low',
      nextSteps: [
        `Próximo paso inmediato: ${avgMood < 5 ? 'Considera hablar con un profesional de salud mental' : 'Mantén tu registro diario de estado de ánimo'}`,
        `Seguimiento sugerido: Revisa tu progreso en ${avgMood < 5 ? 'una semana' : 'dos semanas'}`
      ],
      moodTrend: avgMood >= 7 ? 'improving' : avgMood < 5 ? 'declining' : 'stable',
      keyFactors: [
        `Factor influyente: Tu estado de ánimo promedio de ${avgMood.toFixed(1)}/10 es el factor más significativo`,
        `Factor contextual: ${moodData.moodLogs.length} registros proporcionan una base sólida para el análisis`
      ],
      interventionStrategies: [
        `Estrategia de intervención: ${avgMood < 5 ? 'Implementa técnicas de regulación emocional inmediatas' : 'Mantén y refuerza las estrategias actuales que te funcionan'}`,
        `Técnica terapéutica: ${avgMood < 5 ? 'Considera terapia cognitivo-conductual para patrones de pensamiento' : 'Continúa con técnicas de mantenimiento del bienestar'}`
      ],
      wellnessPlan: [
        `Plan de bienestar: ${avgMood < 5 ? 'Enfócate en actividades que generen placer y satisfacción' : 'Mantén tu rutina actual y considera nuevas actividades positivas'}`,
        `Objetivo a corto plazo: ${avgMood < 5 ? 'Mejorar el estado de ánimo promedio en 1-2 puntos en las próximas dos semanas' : 'Mantener el estado de ánimo actual y explorar nuevas áreas de crecimiento'}`
      ]
    };
  }
}

// Instancias de los agentes
export const drMiaAgent = new DrMiaAgent();
export const drBryanAgent = new DrBryanAgent();
export const moodAnalyzerAgent = new MoodAnalyzerAgent();
