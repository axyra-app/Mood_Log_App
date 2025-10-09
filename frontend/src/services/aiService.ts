import { ChatMessage } from '../types';
import { generateAIResponse as groqGenerateResponse, analyzeCrisisSignals } from './groqService';

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

// Función para generar respuestas de IA usando Groq
export const generateAIResponse = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  doctorType: 'general' | 'specialist' = 'general'
): Promise<AIResponse> => {
  try {
    const doctor = AI_DOCTORS[doctorType];
    
    // Detectar urgencia usando Groq
    const crisisAnalysis = await analyzeCrisisSignals(userMessage);
    
    if (crisisAnalysis.isCrisis && crisisAnalysis.riskLevel === 'high') {
      return generateUrgentResponse('high');
    }
    
    if (crisisAnalysis.isCrisis && crisisAnalysis.riskLevel === 'medium') {
      return generateUrgentResponse('medium');
    }

    // Preparar historial de chat para Groq
    const groqMessages = [
      {
        role: 'user' as const,
        content: `Soy ${doctor.name}, especialista en ${doctor.specialty}. ${doctor.personality}. Mi estilo de respuesta es ${doctor.responseStyle}. Responde como si fueras este doctor virtual.`
      },
      ...chatHistory.slice(-5).map(msg => ({
        role: (msg.senderId === 'ai' ? 'assistant' : 'user') as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // Generar respuesta usando Groq
    const groqResponse = await groqGenerateResponse(groqMessages, {
      isCrisis: crisisAnalysis.isCrisis
    });

    // Generar sugerencias y preguntas de seguimiento
    const suggestions = generateSuggestions(userMessage, crisisAnalysis);
    const followUpQuestions = generateFollowUpQuestions(userMessage, crisisAnalysis);

    return {
      message: groqResponse.content,
      suggestions,
      followUpQuestions
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback a respuestas básicas si Groq falla
    const urgency = detectUrgency(userMessage);
    if (urgency === 'high' || urgency === 'medium') {
      return generateUrgentResponse(urgency);
    }
    
    return {
      message: `Hola, soy ${AI_DOCTORS[doctorType].name}. Estoy aquí para ayudarte con tu salud mental y bienestar. ¿En qué puedo asistirte hoy?`,
      suggestions: ['Consulta sobre síntomas', 'Técnicas de relajación', 'Información sobre salud mental'],
      followUpQuestions: ['¿Cómo te sientes hoy?', '¿Hay algo específico que te preocupa?', '¿Necesitas ayuda con algún síntoma?']
    };
  }
};

// Funciones auxiliares para generar sugerencias y preguntas
const generateSuggestions = (message: string, crisisAnalysis: any): string[] => {
  const lowerMessage = message.toLowerCase();
  
  if (crisisAnalysis.isCrisis) {
    return crisisAnalysis.recommendations || [
      'Contactar ayuda profesional',
      'Buscar apoyo inmediato',
      'Ir a urgencias si es necesario'
    ];
  }
  
  if (lowerMessage.includes('ansiedad') || lowerMessage.includes('nervioso')) {
    return [
      'Técnica 4-7-8 de respiración',
      'Ejercicios de relajación muscular',
      'Identificar patrones de pensamiento'
    ];
  }
  
  if (lowerMessage.includes('depresión') || lowerMessage.includes('triste')) {
    return [
      'Mantener rutinas diarias',
      'Actividad física ligera',
      'Contacto social regular'
    ];
  }
  
  if (lowerMessage.includes('estrés') || lowerMessage.includes('cansancio')) {
    return [
      'Técnicas de relajación',
      'Gestión del tiempo',
      'Actividades de ocio'
    ];
  }
  
  return [
    'Describir síntomas',
    'Compartir sentimientos',
    'Hablar sobre preocupaciones'
  ];
};

const generateFollowUpQuestions = (message: string, crisisAnalysis: any): string[] => {
  const lowerMessage = message.toLowerCase();
  
  if (crisisAnalysis.isCrisis) {
    return [
      '¿Tienes alguien cerca que pueda ayudarte?',
      '¿Puedes ir a un lugar seguro?',
      '¿Necesitas que te ayude a contactar a alguien?'
    ];
  }
  
  if (lowerMessage.includes('ansiedad') || lowerMessage.includes('nervioso')) {
    return [
      '¿Cuándo comenzó esta sensación de ansiedad?',
      '¿Hay situaciones específicas que la desencadenen?',
      '¿Cómo afecta tu día a día?'
    ];
  }
  
  if (lowerMessage.includes('depresión') || lowerMessage.includes('triste')) {
    return [
      '¿Cuánto tiempo llevas sintiéndote así?',
      '¿Has perdido interés en actividades que antes disfrutabas?',
      '¿Has notado cambios en tu sueño o apetito?'
    ];
  }
  
  if (lowerMessage.includes('estrés') || lowerMessage.includes('cansancio')) {
    return [
      '¿Qué tipo de situaciones te causan más estrés?',
      '¿Tienes tiempo para descansar adecuadamente?',
      '¿Cómo manejas normalmente el estrés?'
    ];
  }
  
  return [
    '¿Cuándo comenzó esto?',
    '¿Cómo te afecta en tu día a día?',
    '¿Has notado algún patrón?'
  ];
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
