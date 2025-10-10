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

// Perfiles de doctores IA simulados - Versión Profesional
export const AI_DOCTORS: Record<string, AIDoctorProfile> = {
  general: {
    id: 'ai-general',
    name: 'Dra. Sofia Martínez',
    specialty: 'Psicología Clínica',
    personality: 'Empática, profesional y comprensiva',
    responseStyle: 'Científicamente fundamentada pero cálida y accesible'
  },
  specialist: {
    id: 'ai-specialist',
    name: 'Dr. Carlos Rodríguez',
    specialty: 'Psiquiatría y Terapia Cognitivo-Conductual',
    personality: 'Analítico, detallado y orientado a soluciones',
    responseStyle: 'Técnicamente precisa pero comprensible'
  }
};

// Función para generar respuestas de IA profesional y realista
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

    // Simular delay de procesamiento realista
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 3000));

    // Análisis contextual del mensaje del usuario
    const message = userMessage.toLowerCase();
    const context = analyzeMessageContext(message, chatHistory);
    
    // Respuestas profesionales basadas en evidencia científica
    if (context.includes('ansiedad') || context.includes('panic') || context.includes('nerviosismo')) {
      return generateAnxietyResponse(doctor, message, chatHistory);
    }

    if (context.includes('depresión') || context.includes('tristeza') || context.includes('melancolía')) {
      return generateDepressionResponse(doctor, message, chatHistory);
    }

    if (context.includes('estrés') || context.includes('presión') || context.includes('sobrecarga')) {
      return generateStressResponse(doctor, message, chatHistory);
    }

    if (context.includes('sueño') || context.includes('insomnio') || context.includes('fatiga')) {
      return generateSleepResponse(doctor, message, chatHistory);
    }

    if (context.includes('relaciones') || context.includes('social') || context.includes('familia')) {
      return generateRelationshipResponse(doctor, message, chatHistory);
    }

    if (context.includes('trabajo') || context.includes('laboral') || context.includes('carrera')) {
      return generateWorkResponse(doctor, message, chatHistory);
    }

    if (context.includes('salud') || context.includes('físico') || context.includes('cuerpo')) {
      return generateHealthResponse(doctor, message, chatHistory);
    }

    if (context.includes('hola') || context.includes('saludo') || context.includes('inicio')) {
      return generateGreetingResponse(doctor, chatHistory);
    }

    // Respuesta contextual inteligente
    return generateContextualResponse(doctor, message, chatHistory);

  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      message: 'Disculpa, estoy experimentando dificultades técnicas temporales. Por favor, intenta de nuevo en un momento. Si el problema persiste, considera contactar directamente con un profesional de la salud mental.',
      suggestions: ['Reintentar consulta', 'Contactar soporte técnico', 'Buscar ayuda profesional'],
      followUpQuestions: ['¿Podrías reformular tu pregunta?', '¿Hay algo específico que necesitas abordar?']
    };
  }
};

// Funciones auxiliares para análisis contextual
const analyzeMessageContext = (message: string, chatHistory: ChatMessage[]): string => {
  const contextKeywords = [
    'ansiedad', 'panic', 'nerviosismo', 'preocupación', 'miedo',
    'depresión', 'tristeza', 'melancolía', 'desesperanza',
    'estrés', 'presión', 'sobrecarga', 'tensión',
    'sueño', 'insomnio', 'fatiga', 'cansancio',
    'relaciones', 'social', 'familia', 'amigos',
    'trabajo', 'laboral', 'carrera', 'profesional',
    'salud', 'físico', 'cuerpo', 'síntomas'
  ];
  
  return contextKeywords.find(keyword => message.includes(keyword)) || 'general';
};

// Función para generar respuesta profesional sobre ansiedad
const generateAnxietyResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `Entiendo que estás experimentando síntomas de ansiedad. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante que sepas que la ansiedad es una respuesta natural del sistema nervioso, pero cuando se vuelve persistente puede afectar significativamente tu calidad de vida.`,
      suggestions: [
        'Técnica de respiración diafragmática 4-7-8',
        'Ejercicios de relajación muscular progresiva',
        'Técnicas de mindfulness y grounding',
        'Identificación de patrones de pensamiento'
      ],
      followUpQuestions: [
        '¿Cuándo comenzó a experimentar estos síntomas?',
        '¿Hay situaciones específicas que desencadenen la ansiedad?',
        '¿Cómo está afectando esto su funcionamiento diario?',
        '¿Ha notado algún patrón en la intensidad de los síntomas?'
      ]
    },
    {
      message: `La ansiedad puede manifestarse de diversas formas. Como profesional en ${doctor.specialty}, considero importante evaluar tanto los síntomas físicos como los cognitivos. ¿Podría describir más específicamente qué sensaciones está experimentando?`,
      suggestions: [
        'Registro de síntomas y desencadenantes',
        'Técnicas de respiración controlada',
        'Ejercicios de visualización positiva',
        'Estrategias de distracción cognitiva'
      ],
      followUpQuestions: [
        '¿Experimenta síntomas físicos como palpitaciones o sudoración?',
        '¿Tiene dificultades para concentrarse o tomar decisiones?',
        '¿Los síntomas interfieren con su sueño o apetito?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre depresión
const generateDepressionResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `Comprendo que está pasando por un momento difícil. La depresión es una condición médica seria que afecta tanto el estado de ánimo como el funcionamiento general. Como ${doctor.name}, especialista en ${doctor.specialty}, es crucial abordar esto con la seriedad que merece.`,
      suggestions: [
        'Mantener rutinas diarias estructuradas',
        'Actividad física ligera y regular',
        'Exposición gradual a la luz solar',
        'Contacto social regular y significativo'
      ],
      followUpQuestions: [
        '¿Cuánto tiempo lleva experimentando estos síntomas?',
        '¿Ha notado cambios en su patrón de sueño o apetito?',
        '¿Ha perdido interés en actividades que antes disfrutaba?',
        '¿Tiene pensamientos recurrentes sobre hacerse daño?'
      ]
    },
    {
      message: `La depresión puede manifestarse de manera diferente en cada persona. Como profesional en ${doctor.specialty}, es importante evaluar tanto los síntomas emocionales como los físicos. ¿Podría compartir más detalles sobre cómo se siente actualmente?`,
      suggestions: [
        'Registro diario de estado de ánimo',
        'Actividades placenteras graduales',
        'Técnicas de activación conductual',
        'Estrategias de autocuidado básico'
      ],
      followUpQuestions: [
        '¿Se siente más irritable o triste últimamente?',
        '¿Tiene dificultades para levantarse por las mañanas?',
        '¿Se siente culpable o sin valor?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre estrés
const generateStressResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `El estrés crónico puede tener efectos significativos en su salud física y mental. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante desarrollar estrategias efectivas de manejo del estrés para prevenir el agotamiento.`,
      suggestions: [
        'Técnicas de gestión del tiempo y priorización',
        'Ejercicios de respiración y relajación',
        'Actividades de desconexión y ocio',
        'Establecimiento de límites saludables'
      ],
      followUpQuestions: [
        '¿Qué situaciones específicas le generan más estrés?',
        '¿Cómo está afectando el estrés su rendimiento?',
        '¿Tiene tiempo para actividades de autocuidado?',
        '¿Ha notado cambios en su salud física?'
      ]
    },
    {
      message: `El estrés es una respuesta natural del cuerpo, pero cuando se vuelve crónico puede ser perjudicial. Como profesional en ${doctor.specialty}, considero importante identificar tanto las fuentes de estrés como sus recursos de afrontamiento.`,
      suggestions: [
        'Identificación de estresores específicos',
        'Técnicas de relajación muscular',
        'Ejercicio físico regular',
        'Apoyo social y profesional'
      ],
      followUpQuestions: [
        '¿Qué estrategias ha usado anteriormente para manejar el estrés?',
        '¿Tiene una red de apoyo disponible?',
        '¿El estrés está afectando sus relaciones?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre sueño
const generateSleepResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `Los problemas de sueño pueden afectar significativamente su bienestar general. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante abordar tanto la higiene del sueño como cualquier factor psicológico que pueda estar contribuyendo.`,
      suggestions: [
        'Higiene del sueño: horarios regulares',
        'Rutina relajante antes de dormir',
        'Optimización del ambiente de sueño',
        'Limitación de estimulantes y pantallas'
      ],
      followUpQuestions: [
        '¿Cuántas horas de sueño obtiene normalmente?',
        '¿Tiene dificultad para conciliar el sueño o mantenerlo?',
        '¿Se despierta sintiéndose descansado?',
        '¿Usa dispositivos electrónicos antes de dormir?'
      ]
    },
    {
      message: `El sueño es fundamental para la salud mental y física. Como profesional en ${doctor.specialty}, considero importante evaluar tanto los patrones de sueño como los factores que pueden estar interfiriendo.`,
      suggestions: [
        'Registro de patrones de sueño',
        'Técnicas de relajación para el sueño',
        'Gestión de preocupaciones antes de dormir',
        'Ejercicio físico regular (no cerca de la hora de dormir)'
      ],
      followUpQuestions: [
        '¿Tiene pensamientos acelerados al intentar dormir?',
        '¿Se despierta preocupado o ansioso?',
        '¿Toma medicamentos o suplementos que puedan afectar el sueño?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre relaciones
const generateRelationshipResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `Las relaciones interpersonales son fundamentales para nuestro bienestar emocional. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante entender cómo las dinámicas relacionales están afectando su estado emocional.`,
      suggestions: [
        'Comunicación asertiva y efectiva',
        'Establecimiento de límites saludables',
        'Desarrollo de habilidades sociales',
        'Gestión de conflictos interpersonales'
      ],
      followUpQuestions: [
        '¿Qué tipo de relaciones le están causando más dificultades?',
        '¿Se siente apoyado por su red social?',
        '¿Tiene dificultades para expresar sus necesidades?',
        '¿Los conflictos le generan mucha ansiedad?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre trabajo
const generateWorkResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `El trabajo puede ser una fuente significativa de satisfacción o estrés. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante evaluar cómo el ambiente laboral está impactando su bienestar mental.`,
      suggestions: [
        'Gestión del tiempo y prioridades',
        'Comunicación efectiva con colegas',
        'Equilibrio trabajo-vida personal',
        'Desarrollo de habilidades de afrontamiento'
      ],
      followUpQuestions: [
        '¿Se siente satisfecho con su trabajo actual?',
        '¿Tiene buenas relaciones con sus colegas?',
        '¿El trabajo le está causando estrés excesivo?',
        '¿Ve oportunidades de crecimiento profesional?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta profesional sobre salud física
const generateHealthResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `La conexión entre la salud física y mental es bidireccional. Como ${doctor.name}, especialista en ${doctor.specialty}, es importante considerar cómo los factores físicos pueden estar influyendo en su bienestar emocional.`,
      suggestions: [
        'Ejercicio físico regular y moderado',
        'Alimentación balanceada y nutritiva',
        'Hidratación adecuada',
        'Revisiones médicas regulares'
      ],
      followUpQuestions: [
        '¿Ha notado cambios en su energía o vitalidad?',
        '¿Tiene alguna condición médica que pueda estar afectando su estado de ánimo?',
        '¿Mantiene una rutina de ejercicio regular?',
        '¿Su alimentación ha cambiado recientemente?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para generar respuesta de saludo profesional
const generateGreetingResponse = (doctor: AIDoctorProfile, chatHistory: ChatMessage[]): AIResponse => {
  const isFirstInteraction = chatHistory.length <= 1;
  
  if (isFirstInteraction) {
    return {
      message: `Buenos días. Soy ${doctor.name}, especialista en ${doctor.specialty}. Estoy aquí para brindarle apoyo profesional en temas de salud mental y bienestar. ¿En qué puedo asistirle hoy?`,
      suggestions: [
        'Consulta sobre síntomas específicos',
        'Información sobre técnicas de manejo emocional',
        'Orientación sobre recursos de salud mental',
        'Apoyo en situaciones de crisis'
      ],
      followUpQuestions: [
        '¿Cómo se siente hoy?',
        '¿Hay algo específico que le preocupa?',
        '¿Necesita ayuda con algún síntoma en particular?',
        '¿Ha estado experimentando cambios en su estado de ánimo?'
      ]
    };
  } else {
    return {
      message: `Hola de nuevo. Continuemos trabajando en su bienestar. ¿Cómo se siente después de nuestra conversación anterior?`,
      suggestions: [
        'Continuar con el tema anterior',
        'Explorar nuevos aspectos',
        'Revisar progreso',
        'Abordar nuevas preocupaciones'
      ],
      followUpQuestions: [
        '¿Ha notado algún cambio desde la última vez?',
        '¿Hay algo nuevo que le gustaría discutir?',
        '¿Las sugerencias anteriores le han sido útiles?'
      ]
    };
  }
};

// Función para generar respuesta contextual inteligente
const generateContextualResponse = (doctor: AIDoctorProfile, message: string, chatHistory: ChatMessage[]): AIResponse => {
  const responses = [
    {
      message: `Aprecio que comparta sus experiencias conmigo. Como ${doctor.name}, especialista en ${doctor.specialty}, considero importante entender mejor su situación para poder brindarle el apoyo más adecuado.`,
      suggestions: [
        'Proporcionar más detalles específicos',
        'Describir síntomas o sensaciones',
        'Compartir contexto de la situación',
        'Mencionar factores desencadenantes'
      ],
      followUpQuestions: [
        '¿Podría describir más específicamente lo que está experimentando?',
        '¿Cuándo comenzó a notar estos cambios?',
        '¿Cómo está afectando esto su vida diaria?',
        '¿Ha notado algún patrón en estos síntomas?'
      ]
    },
    {
      message: `Entiendo que está pasando por una situación compleja. Como profesional en ${doctor.specialty}, es importante que sepa que no está solo y que hay recursos disponibles para ayudarle.`,
      suggestions: [
        'Buscar apoyo profesional especializado',
        'Explorar recursos de la comunidad',
        'Desarrollar estrategias de afrontamiento',
        'Considerar terapia o asesoramiento'
      ],
      followUpQuestions: [
        '¿Ha considerado buscar ayuda profesional?',
        '¿Tiene acceso a servicios de salud mental?',
        '¿Qué tipo de apoyo cree que necesitaría?',
        '¿Hay algo específico que le gustaría explorar?'
      ]
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función para detectar urgencia en el mensaje
export const detectUrgency = (message: string): 'low' | 'medium' | 'high' => {
  const urgentKeywords = [
    'suicidio', 'matarme', 'morir', 'acabar con todo', 'no vale la pena vivir',
    'quiero morir', 'mejor muerto', 'no quiero vivir', 'terminar con todo',
    'autolesión', 'cortarme', 'lastimarme', 'hacerme daño'
  ];
  const mediumKeywords = [
    'crisis', 'emergencia', 'ayuda urgente', 'no puedo más', 'desesperado',
    'pánico', 'ataque', 'no puedo respirar', 'me siento muy mal',
    'necesito ayuda ya', 'situación crítica', 'no aguanto más'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }
  
  if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

// Función para generar respuesta de urgencia profesional
export const generateUrgentResponse = (urgency: 'medium' | 'high'): AIResponse => {
  if (urgency === 'high') {
    return {
      message: `Entiendo que está pasando por un momento extremadamente difícil y que tiene pensamientos sobre hacerse daño. Su vida tiene valor incalculable y es importante que sepa que no está solo/a. Como profesional de la salud mental, le recomiendo encarecidamente que busque ayuda inmediata.`,
      suggestions: [
        'Línea Nacional de Prevención del Suicidio: 106 (Colombia)',
        'Acudir inmediatamente a urgencias del hospital más cercano',
        'Contactar con un psicólogo o psiquiatra de emergencia',
        'Buscar apoyo de familiares o amigos cercanos'
      ],
      followUpQuestions: [
        '¿Tiene alguien cerca que pueda ayudarle en este momento?',
        '¿Puede ir a un lugar seguro donde se sienta protegido/a?',
        '¿Necesita que le ayude a contactar con servicios de emergencia?',
        '¿Hay algún profesional de la salud mental que pueda contactar?'
      ]
    };
  }
  
  return {
    message: `Reconozco que está experimentando una crisis emocional significativa. Es importante que busque apoyo profesional lo antes posible. Como especialista en salud mental, le recomiendo que no maneje esta situación solo/a.`,
    suggestions: [
      'Contactar inmediatamente con un psicólogo o psiquiatra',
      'Acudir a un centro de salud mental o consulta de urgencia',
      'Programar una cita médica para evaluación profesional',
      'Buscar apoyo en centros comunitarios de salud mental'
    ],
    followUpQuestions: [
      '¿Tiene acceso a servicios de salud mental en su área?',
      '¿Prefiere consulta presencial o virtual de emergencia?',
      '¿Necesita ayuda para encontrar recursos profesionales?',
      '¿Tiene seguro médico que cubra servicios de salud mental?'
    ]
  };
};
