import Groq from 'groq-sdk';

// Configuración de Groq (GRATIS)
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'gsk_your_api_key_here',
  dangerouslyAllowBrowser: true // Solo para desarrollo
});

// Interfaces para los agentes
export interface MoodAnalysisData {
  moodLogs: Array<{
    mood: number;
    date: Date;
    notes?: string;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface ChatAnalysisData {
  messages: Array<{
    content: string;
    timestamp: Date;
    sender: 'user' | 'psychologist';
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CrisisAssessmentData {
  recentMoodLogs: Array<{
    mood: number;
    date: Date;
    notes?: string;
  }>;
  recentMessages: Array<{
    content: string;
    timestamp: Date;
  }>;
  userProfile: {
    age?: number;
    hasHistoryOfCrisis?: boolean;
  };
}

// 🤖 AGENTE 1: ANÁLISIS DE ESTADO DE ÁNIMO
export class MoodAnalysisAgent {
  private systemPrompt = `Eres un psicólogo clínico especializado en análisis de patrones emocionales y bienestar mental. 
Analiza los datos de estado de ánimo del usuario con enfoque profesional y empático.

INSTRUCCIONES ESPECÍFICAS:
- Sé empático y comprensivo en tu análisis
- Identifica patrones emocionales significativos
- Proporciona insights basados en evidencia psicológica
- Sugiere intervenciones apropiadas y realistas
- Evalúa el nivel de riesgo de manera conservadora
- Usa lenguaje profesional pero accesible

RESPONDE EN FORMATO JSON:
{
  "summary": "Resumen empático del estado emocional del usuario",
  "patterns": ["patrón emocional específico identificado", "tendencia de comportamiento", "patrón temporal"],
  "insights": ["insight psicológico basado en evidencia", "observación clínica relevante", "hallazgo significativo"],
  "recommendations": ["intervención específica y práctica", "técnica de manejo emocional", "estrategia de bienestar"],
  "riskLevel": "low|medium|high",
  "nextSteps": ["acción inmediata recomendada", "seguimiento sugerido"]
}`;

  async analyzeMood(data: MoodAnalysisData): Promise<any> {
    try {
      const prompt = `
        Analiza estos datos de estado de ánimo:
        
        Período: ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}
        
        Registros de ánimo:
        ${data.moodLogs.map(log => 
          `- Fecha: ${log.date.toLocaleDateString()}, Estado: ${log.mood}/10${log.notes ? `, Notas: ${log.notes}` : ''}`
        ).join('\n')}
        
        Proporciona un análisis profesional y recomendaciones.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error en análisis de estado de ánimo:', error);
      return {
        summary: 'Error al analizar los datos',
        patterns: [],
        insights: [],
        recommendations: ['Contacta a tu psicólogo para un análisis más detallado'],
        riskLevel: 'low',
        nextSteps: []
      };
    }
  }
}

// 🤖 AGENTE 2: ANÁLISIS DE CONVERSACIONES
export class ChatAnalysisAgent {
  private systemPrompt = `Eres un psicólogo clínico especializado en análisis de comunicación terapéutica y procesos de cambio.
Analiza las conversaciones entre usuario y psicólogo con enfoque profesional y clínico.

INSTRUCCIONES ESPECÍFICAS:
- Evalúa la calidad de la comunicación terapéutica
- Identifica temas recurrentes y patrones de comunicación
- Analiza el progreso terapéutico y la alianza terapéutica
- Detecta señales de resistencia o colaboración
- Proporciona insights sobre el proceso terapéutico
- Sugiere mejoras en la comunicación

RESPONDE EN FORMATO JSON:
{
  "summary": "Evaluación general de la comunicación terapéutica",
  "themes": ["tema terapéutico principal", "preocupación recurrente", "área de trabajo"],
  "progress": "Evaluación del progreso terapéutico y cambios observados",
  "insights": ["insight sobre el proceso terapéutico", "observación sobre la alianza", "hallazgo clínico"],
  "recommendations": ["sugerencia para mejorar la comunicación", "estrategia terapéutica recomendada"],
  "engagement": "low|medium|high"
}`;

  async analyzeChat(data: ChatAnalysisData): Promise<any> {
    try {
      const prompt = `
        Analiza estas conversaciones terapéuticas:
        
        Período: ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}
        
        Mensajes:
        ${data.messages.map(msg => 
          `- ${msg.sender}: ${msg.content} (${msg.timestamp.toLocaleDateString()})`
        ).join('\n')}
        
        Proporciona un análisis profesional de la comunicación terapéutica.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error en análisis de conversaciones:', error);
      return {
        summary: 'Error al analizar las conversaciones',
        themes: [],
        progress: 'No se pudo evaluar el progreso',
        insights: [],
        recommendations: ['Contacta a tu psicólogo para un análisis más detallado'],
        engagement: 'medium'
      };
    }
  }
}

// 🤖 AGENTE 3: DETECCIÓN DE CRISIS
export class CrisisDetectionAgent {
  private systemPrompt = `Eres un psicólogo clínico especializado en evaluación de riesgo y crisis en salud mental.
Analiza los datos del usuario para identificar señales de alerta y determinar el nivel de riesgo con máxima precisión.

INSTRUCCIONES ESPECÍFICAS:
- Evalúa el riesgo de manera conservadora y profesional
- Identifica señales de alerta específicas y objetivas
- Considera factores protectores y de riesgo
- Proporciona acciones inmediatas basadas en evidencia
- Usa criterios clínicos establecidos para evaluación de riesgo
- Prioriza la seguridad del usuario

CRITERIOS DE EVALUACIÓN:
- LOW: Estado emocional estable, sin señales de riesgo
- MEDIUM: Algunas señales de preocupación, requiere seguimiento
- HIGH: Múltiples señales de riesgo, requiere intervención profesional
- CRITICAL: Señales graves de crisis, requiere atención inmediata

RESPONDE EN FORMATO JSON:
{
  "riskLevel": "low|medium|high|critical",
  "indicators": ["señal específica identificada", "comportamiento preocupante", "patrón de riesgo"],
  "immediateActions": ["acción inmediata específica", "intervención recomendada"],
  "recommendations": ["recomendación profesional", "estrategia de manejo"],
  "urgent": true|false,
  "contactProfessional": true|false
}`;

  async assessCrisis(data: CrisisAssessmentData): Promise<any> {
    try {
      const prompt = `
        Evalúa el riesgo de crisis para este usuario:
        
        Registros de ánimo recientes:
        ${data.recentMoodLogs.map(log => 
          `- Estado: ${log.mood}/10, Fecha: ${log.date.toLocaleDateString()}${log.notes ? `, Notas: ${log.notes}` : ''}`
        ).join('\n')}
        
        Mensajes recientes:
        ${data.recentMessages.map(msg => 
          `- ${msg.content} (${msg.timestamp.toLocaleDateString()})`
        ).join('\n')}
        
        Perfil del usuario:
        - Edad: ${data.userProfile.age || 'No especificada'}
        - Historial de crisis: ${data.userProfile.hasHistoryOfCrisis ? 'Sí' : 'No'}
        
        Determina el nivel de riesgo y las acciones recomendadas.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3, // Menor temperatura para evaluaciones más consistentes
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error en evaluación de crisis:', error);
      return {
        riskLevel: 'medium',
        indicators: ['Error en el análisis'],
        immediateActions: ['Contacta a un profesional de salud mental'],
        recommendations: ['Busca ayuda profesional inmediatamente'],
        urgent: true,
        contactProfessional: true
      };
    }
  }
}

// 🤖 AGENTE 4: RECOMENDACIONES PERSONALIZADAS
export class RecommendationAgent {
  private systemPrompt = `Eres un psicólogo especializado en recomendaciones personalizadas de bienestar.
Basándote en el análisis de datos del usuario, proporciona recomendaciones específicas y accionables.

RESPONDE EN FORMATO JSON:
{
  "dailyRecommendations": ["recomendación 1", "recomendación 2"],
  "weeklyGoals": ["objetivo 1", "objetivo 2"],
  "techniques": ["técnica 1", "técnica 2"],
  "resources": ["recurso 1", "recurso 2"],
  "priority": "high|medium|low"
}`;

  async generateRecommendations(analysisData: any): Promise<any> {
    try {
      const prompt = `
        Genera recomendaciones personalizadas basadas en este análisis:
        
        ${JSON.stringify(analysisData, null, 2)}
        
        Proporciona recomendaciones específicas, técnicas y recursos útiles.
      `;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.8,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return {
        dailyRecommendations: ['Mantén una rutina regular de sueño'],
        weeklyGoals: ['Practica técnicas de relajación'],
        techniques: ['Respiración profunda', 'Meditación'],
        resources: ['Contacta a tu psicólogo'],
        priority: 'medium'
      };
    }
  }
}

// Instancias de los agentes
export const moodAnalysisAgent = new MoodAnalysisAgent();
export const chatAnalysisAgent = new ChatAnalysisAgent();
export const crisisDetectionAgent = new CrisisDetectionAgent();
export const recommendationAgent = new RecommendationAgent();
