import { AIAnalysis, MoodLog, WellnessInsights } from '../types';

// AI Analysis Functions
export const analyzeMoodWithAI = async (
  moodLog: Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AIAnalysis> => {
  try {
    // Simulate AI analysis - in production, this would call OpenAI API
    const analysis = await simulateAIAnalysis(moodLog);
    return analysis;
  } catch (error) {
    console.error('Error analyzing mood with AI:', error);
    throw error;
  }
};

const simulateAIAnalysis = async (moodLog: Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIAnalysis> => {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { mood, energy, stress, sleep, notes, activities, emotions } = moodLog;

  // Determine primary emotion based on mood and emotions
  let primaryEmotion = 'neutral';
  let confidence = 50;

  if (mood >= 4) {
    primaryEmotion = emotions.includes('joy') ? 'joy' : 'contentment';
    confidence = 85;
  } else if (mood <= 2) {
    primaryEmotion = emotions.includes('sadness') ? 'sadness' : 'frustration';
    confidence = 80;
  } else if (emotions.includes('anxiety') || stress >= 7) {
    primaryEmotion = 'anxiety';
    confidence = 75;
  } else if (emotions.includes('anger') || emotions.includes('frustration')) {
    primaryEmotion = 'anger';
    confidence = 70;
  }

  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (mood >= 4 && energy >= 6) {
    sentiment = 'positive';
  } else if (mood <= 2 || stress >= 7) {
    sentiment = 'negative';
  }

  // Generate suggestions based on patterns
  const suggestions: string[] = [];

  if (mood <= 2) {
    suggestions.push('Considera actividades que te hagan sentir mejor, como escuchar música o dar un paseo');
    suggestions.push('Practica técnicas de respiración profunda para reducir el estrés');
  }

  if (stress >= 7) {
    suggestions.push('Intenta técnicas de relajación como meditación o yoga');
    suggestions.push('Considera hablar con alguien de confianza sobre lo que te preocupa');
  }

  if (sleep <= 4) {
    suggestions.push('Establece una rutina de sueño consistente');
    suggestions.push('Evita pantallas 1 hora antes de dormir');
  }

  if (energy <= 4) {
    suggestions.push('Asegúrate de mantenerte hidratado y comer comidas balanceadas');
    suggestions.push('Considera hacer ejercicio ligero para aumentar tu energía');
  }

  // Identify patterns
  const patterns: string[] = [];

  if (activities.includes('exercise') && mood >= 4) {
    patterns.push('El ejercicio parece mejorar tu estado de ánimo');
  }

  if (activities.includes('social') && mood >= 4) {
    patterns.push('Las actividades sociales tienen un impacto positivo en tu bienestar');
  }

  if (stress >= 7 && sleep <= 4) {
    patterns.push('El alto estrés puede estar afectando tu calidad de sueño');
  }

  if (emotions.includes('gratitude') && mood >= 4) {
    patterns.push('Practicar gratitud parece tener un efecto positivo en tu estado de ánimo');
  }

  return {
    primaryEmotion,
    confidence,
    sentiment,
    suggestions,
    patterns,
  };
};

export const generatePersonalizedRecommendations = async (
  userId: string,
  insights: WellnessInsights,
  recentMoodLogs: MoodLog[]
): Promise<string[]> => {
  try {
    const recommendations: string[] = [];

    // Based on overall score
    if (insights.overallScore < 50) {
      recommendations.push('Considera buscar apoyo profesional para mejorar tu bienestar general');
      recommendations.push('Establece metas pequeñas y alcanzables para construir momentum positivo');
    } else if (insights.overallScore > 80) {
      recommendations.push('¡Excelente trabajo! Mantén las prácticas que te están funcionando');
      recommendations.push('Considera compartir tus estrategias exitosas con otros');
    }

    // Based on emotional patterns
    insights.patterns.forEach((pattern) => {
      if (pattern.frequency > 0.3 && pattern.intensity < 3) {
        recommendations.push(`Desarrolla estrategias específicas para manejar la emoción de ${pattern.emotion}`);
      }

      if (pattern.triggers.length > 0) {
        recommendations.push(
          `Identifica alternativas saludables para las actividades que desencadenan ${pattern.emotion}`
        );
      }
    });

    // Based on trends
    insights.trends.forEach((trend) => {
      if (trend.trend === 'declining') {
        recommendations.push('Implementa actividades de autocuidado diarias para revertir la tendencia negativa');
        recommendations.push('Considera hablar con un profesional de la salud mental');
      } else if (trend.trend === 'improving') {
        recommendations.push('Continúa con las prácticas que están funcionando para ti');
        recommendations.push('Documenta qué cambios específicos han contribuido a tu mejora');
      }
    });

    // Based on recent mood logs
    if (recentMoodLogs.length > 0) {
      const recentMoods = recentMoodLogs.slice(0, 7).map((log) => log.mood);
      const avgRecentMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;

      if (avgRecentMood < 3) {
        recommendations.push('Enfócate en actividades que te traigan alegría y satisfacción');
        recommendations.push('Considera mantener un diario de gratitud para cambiar tu perspectiva');
      }

      // Check for specific patterns in recent logs
      const hasExercise = recentMoodLogs.some((log) => log.activities.includes('exercise'));
      const hasSocial = recentMoodLogs.some((log) => log.activities.includes('social'));

      if (!hasExercise && avgRecentMood < 4) {
        recommendations.push('Considera incorporar actividad física regular, incluso caminar 10 minutos al día');
      }

      if (!hasSocial && avgRecentMood < 4) {
        recommendations.push('Conecta con amigos o familiares, incluso una conversación breve puede ayudar');
      }
    }

    // Based on risk factors
    if (insights.riskFactors.length > 0) {
      recommendations.push('Es importante que busques apoyo profesional si experimentas dificultades persistentes');
      recommendations.push('Mantén una red de apoyo sólida y no dudes en pedir ayuda cuando la necesites');
    }

    // Based on protective factors
    if (insights.protectiveFactors.length > 0) {
      recommendations.push('Identifica y nutre los factores que contribuyen a tu bienestar');
      recommendations.push('Comparte tus estrategias exitosas con otros que puedan beneficiarse');
    }

    return recommendations.slice(0, 10); // Limit to 10 recommendations
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    throw error;
  }
};

export const detectCrisisSignals = async (
  moodLogs: MoodLog[]
): Promise<{
  hasCrisisSignals: boolean;
  signals: string[];
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
}> => {
  try {
    const signals: string[] = [];
    let urgency: 'low' | 'medium' | 'high' = 'low';

    if (moodLogs.length === 0) {
      return {
        hasCrisisSignals: false,
        signals: [],
        urgency: 'low',
        recommendations: [],
      };
    }

    // Check recent mood patterns (last 7 days)
    const recentLogs = moodLogs.slice(0, 7);
    const recentMoods = recentLogs.map((log) => log.mood);
    const avgRecentMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;

    // Crisis signal detection
    if (avgRecentMood <= 1.5) {
      signals.push('Estado de ánimo extremadamente bajo persistente');
      urgency = 'high';
    } else if (avgRecentMood <= 2) {
      signals.push('Estado de ánimo muy bajo');
      urgency = 'medium';
    }

    // Check for concerning emotions
    const concerningEmotions = recentLogs.some((log) =>
      log.emotions.some((emotion) =>
        ['hopelessness', 'despair', 'suicidal', 'self-harm'].includes(emotion.toLowerCase())
      )
    );

    if (concerningEmotions) {
      signals.push('Presencia de emociones muy preocupantes');
      urgency = 'high';
    }

    // Check for isolation patterns
    const hasSocialActivities = recentLogs.some((log) =>
      log.activities.some((activity) => ['social', 'friends', 'family', 'community'].includes(activity.toLowerCase()))
    );

    if (!hasSocialActivities && avgRecentMood <= 2.5) {
      signals.push('Aislamiento social combinado con bajo estado de ánimo');
      urgency = 'medium';
    }

    // Check for sleep disturbances
    const avgSleep = recentLogs.reduce((sum, log) => sum + (log.sleep || 5), 0) / recentLogs.length;
    if (avgSleep <= 3) {
      signals.push('Disturbios severos del sueño');
      urgency = 'medium';
    }

    // Check for high stress levels
    const avgStress = recentLogs.reduce((sum, log) => sum + (log.stress || 5), 0) / recentLogs.length;
    if (avgStress >= 8) {
      signals.push('Niveles de estrés extremadamente altos');
      urgency = 'medium';
    }

    // Generate recommendations based on urgency
    const recommendations: string[] = [];

    if (urgency === 'high') {
      recommendations.push('🚨 Busca ayuda profesional inmediatamente');
      recommendations.push('Contacta a un profesional de salud mental o línea de crisis');
      recommendations.push('No estás solo - hay personas que pueden ayudarte');
    } else if (urgency === 'medium') {
      recommendations.push('Considera hablar con un profesional de salud mental');
      recommendations.push('Mantén contacto regular con tu red de apoyo');
      recommendations.push('Implementa estrategias de autocuidado diarias');
    } else {
      recommendations.push('Continúa monitoreando tu bienestar');
      recommendations.push('Mantén las prácticas que te están funcionando');
    }

    return {
      hasCrisisSignals: signals.length > 0,
      signals,
      urgency,
      recommendations,
    };
  } catch (error) {
    console.error('Error detecting crisis signals:', error);
    throw error;
  }
};

export const generateMoodPrediction = async (
  userId: string,
  moodLogs: MoodLog[]
): Promise<{
  predictedMood: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}> => {
  try {
    if (moodLogs.length < 7) {
      return {
        predictedMood: 3,
        confidence: 30,
        factors: ['Datos insuficientes para predicción precisa'],
        recommendations: ['Continúa registrando tu estado de ánimo para obtener predicciones más precisas'],
      };
    }

    // Analyze recent patterns
    const recentLogs = moodLogs.slice(0, 14); // Last 2 weeks
    const moods = recentLogs.map((log) => log.mood);
    const activities = recentLogs.flatMap((log) => log.activities);
    const emotions = recentLogs.flatMap((log) => log.emotions);

    // Calculate trend
    const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
    const secondHalf = moods.slice(Math.floor(moods.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, mood) => sum + mood, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, mood) => sum + mood, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;

    // Predict based on trend and patterns
    let predictedMood = moods[moods.length - 1]; // Start with last mood
    let confidence = 50;
    const factors: string[] = [];

    // Adjust based on trend
    if (trend > 0.2) {
      predictedMood += 0.3;
      factors.push('Tendencia de mejora detectada');
      confidence += 10;
    } else if (trend < -0.2) {
      predictedMood -= 0.3;
      factors.push('Tendencia de declive detectada');
      confidence += 10;
    }

    // Adjust based on activities
    const positiveActivities = ['exercise', 'social', 'hobby', 'nature', 'music'];
    const negativeActivities = ['isolation', 'conflict', 'work_stress'];

    const positiveActivityCount = activities.filter((activity) =>
      positiveActivities.some((pa) => activity.toLowerCase().includes(pa))
    ).length;

    const negativeActivityCount = activities.filter((activity) =>
      negativeActivities.some((na) => activity.toLowerCase().includes(na))
    ).length;

    if (positiveActivityCount > negativeActivityCount) {
      predictedMood += 0.2;
      factors.push('Actividades positivas predominantes');
      confidence += 5;
    } else if (negativeActivityCount > positiveActivityCount) {
      predictedMood -= 0.2;
      factors.push('Actividades negativas predominantes');
      confidence += 5;
    }

    // Adjust based on emotions
    const positiveEmotions = ['joy', 'gratitude', 'contentment', 'peace', 'excitement'];
    const negativeEmotions = ['sadness', 'anger', 'anxiety', 'fear', 'frustration'];

    const positiveEmotionCount = emotions.filter((emotion) =>
      positiveEmotions.some((pe) => emotion.toLowerCase().includes(pe))
    ).length;

    const negativeEmotionCount = emotions.filter((emotion) =>
      negativeEmotions.some((ne) => emotion.toLowerCase().includes(ne))
    ).length;

    if (positiveEmotionCount > negativeEmotionCount) {
      predictedMood += 0.1;
      factors.push('Emociones positivas predominantes');
    } else if (negativeEmotionCount > positiveEmotionCount) {
      predictedMood -= 0.1;
      factors.push('Emociones negativas predominantes');
    }

    // Ensure mood is within bounds
    predictedMood = Math.max(1, Math.min(5, Math.round(predictedMood * 10) / 10));
    confidence = Math.min(95, Math.max(30, confidence));

    // Generate recommendations
    const recommendations: string[] = [];

    if (predictedMood < 3) {
      recommendations.push('Considera actividades que mejoren tu estado de ánimo');
      recommendations.push('Practica técnicas de relajación y mindfulness');
    } else if (predictedMood > 4) {
      recommendations.push('Mantén las actividades que te están funcionando');
      recommendations.push('Considera compartir tu bienestar con otros');
    }

    if (trend < -0.2) {
      recommendations.push('Implementa estrategias para revertir la tendencia negativa');
      recommendations.push('Considera buscar apoyo profesional');
    }

    return {
      predictedMood,
      confidence,
      factors,
      recommendations,
    };
  } catch (error) {
    console.error('Error generating mood prediction:', error);
    throw error;
  }
};

export const generateInsightsReport = async (
  userId: string,
  insights: WellnessInsights,
  moodLogs: MoodLog[]
): Promise<{
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  nextSteps: string[];
}> => {
  try {
    const summary = `Basado en el análisis de ${
      moodLogs.length
    } registros de estado de ánimo, tu puntuación general de bienestar es ${insights.overallScore}/100. ${
      insights.overallScore >= 70
        ? 'Esto indica un buen nivel de bienestar general.'
        : insights.overallScore >= 50
        ? 'Hay oportunidades para mejorar tu bienestar.'
        : 'Es importante enfocarse en mejorar tu bienestar general.'
    }`;

    const keyFindings: string[] = [];

    // Add findings based on overall score
    if (insights.overallScore >= 80) {
      keyFindings.push('Excelente nivel de bienestar general');
    } else if (insights.overallScore >= 60) {
      keyFindings.push('Buen nivel de bienestar con áreas de mejora');
    } else {
      keyFindings.push('Oportunidades significativas para mejorar el bienestar');
    }

    // Add findings based on trends
    insights.trends.forEach((trend) => {
      if (trend.trend === 'improving') {
        keyFindings.push('Tendencia positiva en el estado de ánimo');
      } else if (trend.trend === 'declining') {
        keyFindings.push('Tendencia preocupante en el estado de ánimo');
      }
    });

    // Add findings based on patterns
    insights.patterns.slice(0, 3).forEach((pattern) => {
      keyFindings.push(
        `Emoción más frecuente: ${pattern.emotion} (${Math.round(pattern.frequency * 100)}% del tiempo)`
      );
    });

    // Add findings based on strengths and areas for improvement
    if (insights.strengths.length > 0) {
      keyFindings.push(`Fortalezas identificadas: ${insights.strengths.slice(0, 2).join(', ')}`);
    }

    if (insights.areasForImprovement.length > 0) {
      keyFindings.push(`Áreas de mejora: ${insights.areasForImprovement.slice(0, 2).join(', ')}`);
    }

    const recommendations = insights.recommendations.slice(0, 5);

    const nextSteps: string[] = [];

    if (insights.overallScore < 50) {
      nextSteps.push('Considera buscar apoyo profesional');
      nextSteps.push('Implementa una rutina de autocuidado diaria');
    } else if (insights.overallScore < 70) {
      nextSteps.push('Enfócate en las áreas de mejora identificadas');
      nextSteps.push('Mantén las prácticas que te están funcionando');
    } else {
      nextSteps.push('Continúa con tus prácticas actuales');
      nextSteps.push('Considera compartir tus estrategias exitosas');
    }

    nextSteps.push('Continúa registrando tu estado de ánimo regularmente');
    nextSteps.push('Revisa este reporte semanalmente para monitorear tu progreso');

    return {
      summary,
      keyFindings,
      recommendations,
      nextSteps,
    };
  } catch (error) {
    console.error('Error generating insights report:', error);
    throw error;
  }
};
