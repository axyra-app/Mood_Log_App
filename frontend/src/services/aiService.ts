import { ChatMessage } from '../types';

export interface AIResponse {
  message: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface AIDoctorProfile {
  id: string;
  name: string;
  specialty: string;
  personality: string;
  responseStyle: string;
}

// Perfiles de doctores IA simulados
export const AI_DOCTORS: Record<string, AIDoctorProfile> = {
  general: {
    id: 'ai-general',
    name: 'Dr. Sofia IA',
    specialty: 'Medicina General',
    personality: 'Empática y comprensiva',
    responseStyle: 'Profesional pero cálida'
  },
  specialist: {
    id: 'ai-specialist',
    name: 'Dr. Carlos IA',
    specialty: 'Psicología Clínica',
    personality: 'Analítico y detallado',
    responseStyle: 'Técnico pero accesible'
  }
};

// Función para generar respuestas de IA (versión simplificada sin Groq por ahora)
export const generateAIResponse = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  doctorType: 'general' | 'specialist' = 'general'
): Promise<AIResponse> => {
  try {
    const doctor = AI_DOCTORS[doctorType];
    
    // Detectar urgencia usando función local
    const urgency = detectUrgency(userMessage);
    
    if (urgency === 'high' || urgency === 'medium') {
      return generateUrgentResponse(urgency);
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Análisis básico del mensaje del usuario
    const message = userMessage.toLowerCase();
    
    // Respuestas contextuales basadas en palabras clave
    if (message.includes('ansiedad') || message.includes('ansioso') || message.includes('nervioso')) {
      return {
        message: `Entiendo que estás experimentando ansiedad. Como ${doctor.name}, especialista en ${doctor.specialty}, puedo ayudarte con esto. La ansiedad es una respuesta natural del cuerpo, pero cuando es excesiva puede afectar tu bienestar. Te sugiero algunas técnicas que pueden ayudarte:`,
        suggestions: [
          'Técnica 4-7-8 de respiración',
          'Ejercicios de relajación muscular',
          'Identificar patrones de pensamiento'
        ],
        followUpQuestions: [
          '¿Cuándo comenzó esta sensación de ansiedad?',
          '¿Hay situaciones específicas que la desencadenen?',
          '¿Cómo afecta tu día a día?'
        ]
      };
    }

    if (message.includes('depresión') || message.includes('triste') || message.includes('deprimido')) {
      return {
        message: `Comprendo que estás pasando por un momento difícil. La depresión es una condición seria que requiere atención profesional. Como ${doctor.name}, quiero ayudarte. ¿Has notado cambios en tu sueño o apetito recientemente?`,
        suggestions: [
          'Mantener rutinas diarias',
          'Actividad física ligera',
          'Contacto social regular'
        ],
        followUpQuestions: [
          '¿Cuánto tiempo llevas sintiéndote así?',
          '¿Has perdido interés en actividades que antes disfrutabas?',
          '¿Tienes pensamientos sobre hacerse daño?'
        ]
      };
    }

    if (message.includes('estrés') || message.includes('estresado') || message.includes('cansancio') || message.includes('cansado')) {
      return {
        message: `Veo que estás experimentando estrés y cansancio. Es normal sentirse agotado después de actividad física intensa o trabajo demandante. Como ${doctor.name}, te recomiendo un enfoque integral para recuperarte:`,
        suggestions: [
          'Descanso y recuperación muscular',
          'Hidratación adecuada',
          'Técnicas de relajación para el estrés'
        ],
        followUpQuestions: [
          '¿Qué tipo de actividades te causan más estrés?',
          '¿Tienes tiempo para descansar adecuadamente?',
          '¿Cómo manejas normalmente el estrés?'
        ]
      };
    }

    if (message.includes('sueño') || message.includes('dormir') || message.includes('insomnio')) {
      return {
        message: `Los problemas de sueño pueden afectar significativamente tu bienestar. Como ${doctor.name}, especialista en ${doctor.specialty}, te ayudo a mejorar tu higiene del sueño. ¿Cuántas horas duermes normalmente?`,
        suggestions: [
          'Higiene del sueño',
          'Rutina antes de dormir',
          'Evitar pantallas antes de dormir'
        ],
        followUpQuestions: [
          '¿Tienes dificultad para conciliar el sueño?',
          '¿Te despiertas frecuentemente durante la noche?',
          '¿Usas dispositivos electrónicos antes de dormir?'
        ]
      };
    }

    if (message.includes('hola') || message.includes('buenos días') || message.includes('buenas tardes')) {
      return {
        message: `¡Hola! Soy ${doctor.name}, tu asistente médico virtual especializado en ${doctor.specialty}. Estoy aquí para ayudarte con cualquier consulta sobre tu salud mental y bienestar. ¿En qué puedo asistirte hoy?`,
        suggestions: [
          'Consulta sobre síntomas',
          'Técnicas de relajación',
          'Información sobre salud mental'
        ],
        followUpQuestions: [
          '¿Cómo te sientes hoy?',
          '¿Hay algo específico que te preocupa?',
          '¿Necesitas ayuda con algún síntoma?'
        ]
      };
    }

    // Respuesta por defecto
    return {
      message: `Gracias por compartir eso conmigo. Como ${doctor.name}, especialista en ${doctor.specialty}, quiero ayudarte de la mejor manera. ¿Podrías darme más detalles sobre lo que estás experimentando?`,
      suggestions: [
        'Describir síntomas',
        'Compartir sentimientos',
        'Hablar sobre preocupaciones'
      ],
      followUpQuestions: [
        '¿Cuándo comenzó esto?',
        '¿Cómo te afecta en tu día a día?',
        '¿Has notado algún patrón?'
      ]
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      message: 'Disculpa, estoy teniendo dificultades técnicas. Por favor, intenta de nuevo en un momento.',
      suggestions: ['Reintentar', 'Contactar soporte'],
      followUpQuestions: ['¿Podrías repetir tu pregunta?']
    };
  }
};

// Función para detectar urgencia en el mensaje
export const detectUrgency = (message: string): 'low' | 'medium' | 'high' => {
  const urgentKeywords = ['suicidio', 'matarme', 'morir', 'acabar con todo', 'no vale la pena vivir'];
  const mediumKeywords = ['crisis', 'emergencia', 'ayuda urgente', 'no puedo más'];
  
  const lowerMessage = message.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }
  
  if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

// Función para generar respuesta de urgencia
export const generateUrgentResponse = (urgency: 'medium' | 'high'): AIResponse => {
  if (urgency === 'high') {
    return {
      message: 'Entiendo que estás pasando por un momento muy difícil. Tu vida tiene valor y hay ayuda disponible. Por favor, contacta inmediatamente con: Línea Nacional de Prevención del Suicidio: 106 (Colombia). También puedes acudir a urgencias del hospital más cercano. No estás solo/a.',
      suggestions: [
        'Llamar línea de crisis',
        'Ir a urgencias',
        'Contactar psicólogo de emergencia'
      ],
      followUpQuestions: [
        '¿Tienes alguien cerca que pueda ayudarte?',
        '¿Puedes ir a un lugar seguro?',
        '¿Necesitas que te ayude a contactar a alguien?'
      ]
    };
  }
  
  return {
    message: 'Veo que estás en una situación difícil. Es importante que busques ayuda profesional pronto. Te recomiendo contactar con un psicólogo o psiquiatra para una evaluación. ¿Tienes acceso a servicios de salud mental?',
    suggestions: [
      'Buscar psicólogo local',
      'Contactar centro de salud',
      'Programar cita médica'
    ],
    followUpQuestions: [
      '¿Tienes seguro médico?',
      '¿Prefieres consulta presencial o virtual?',
      '¿Necesitas ayuda para encontrar recursos?'
    ]
  };
};
