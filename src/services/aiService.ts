// AI Service for emotion analysis
// This is a mock implementation that simulates AI analysis
// In a real application, you would integrate with services like OpenAI, Google Cloud AI, or Azure Cognitive Services

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions: string[];
  keywords: string[];
  intensity: number;
}

export interface MoodData {
  description: string;
  mood: number;
  activities: string[];
  wellness: {
    sleep: number;
    stress: number;
    energy: number;
    social: number;
  };
  habits: {
    exercise: boolean;
    meditation: boolean;
    nutrition: boolean;
    gratitude: boolean;
  };
}

class AIService {
  private emotions = [
    'Felicidad',
    'Tristeza',
    'Ansiedad',
    'Tranquilidad',
    'Motivación',
    'Frustración',
    'Esperanza',
    'Miedo',
    'Alegría',
    'Enojo',
    'Calma',
    'Preocupación',
    'Entusiasmo',
    'Melancolía',
    'Gratitud',
  ];

  private positiveKeywords = [
    'bien',
    'feliz',
    'contento',
    'genial',
    'excelente',
    'maravilloso',
    'perfecto',
    'increíble',
    'fantástico',
    'alegre',
    'optimista',
    'motivado',
    'energético',
    'satisfecho',
    'orgulloso',
    'agradecido',
  ];

  private negativeKeywords = [
    'mal',
    'triste',
    'deprimido',
    'ansioso',
    'preocupado',
    'estresado',
    'cansado',
    'frustrado',
    'enojado',
    'molesto',
    'desanimado',
    'solo',
    'vacío',
    'perdido',
    'confundido',
    'asustado',
  ];

  private neutralKeywords = [
    'normal',
    'regular',
    'ok',
    'bien',
    'neutral',
    'equilibrado',
    'tranquilo',
    'calmado',
    'estable',
    'rutinario',
    'habitual',
  ];

  private suggestions = {
    positive: [
      '¡Excelente! Mantén estas actividades que te hacen sentir bien',
      'Considera compartir tu experiencia positiva con otros',
      'Continúa con tus hábitos saludables actuales',
      'Aprovecha esta energía positiva para establecer nuevas metas',
    ],
    negative: [
      'Considera hacer ejercicio para mejorar tu estado de ánimo',
      'La meditación puede ayudarte a reducir el estrés y la ansiedad',
      'Habla con un profesional de la salud mental si persisten estos sentimientos',
      'Mantén una rutina de sueño regular para mejorar tu bienestar',
      'Practica técnicas de respiración profunda cuando te sientas abrumado',
    ],
    neutral: [
      'Mantén un equilibrio en tus actividades diarias',
      'Considera agregar nuevas actividades que te generen interés',
      'La estabilidad es buena, pero no olvides buscar momentos de alegría',
      'Practica la gratitud diaria para mejorar tu perspectiva',
    ],
  };

  async analyzeEmotion(moodData: MoodData): Promise<EmotionAnalysis> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const description = moodData.description.toLowerCase();

    // Analyze sentiment based on keywords
    const positiveCount = this.positiveKeywords.filter((keyword) => description.includes(keyword)).length;

    const negativeCount = this.negativeKeywords.filter((keyword) => description.includes(keyword)).length;

    const neutralCount = this.neutralKeywords.filter((keyword) => description.includes(keyword)).length;

    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    // Determine emotion based on mood score and sentiment
    let emotion: string;
    if (moodData.mood >= 4) {
      emotion = sentiment === 'positive' ? 'Felicidad' : 'Alegría';
    } else if (moodData.mood <= 2) {
      emotion = sentiment === 'negative' ? 'Tristeza' : 'Melancolía';
    } else {
      if (sentiment === 'positive') {
        emotion = 'Tranquilidad';
      } else if (sentiment === 'negative') {
        emotion = 'Ansiedad';
      } else {
        emotion = 'Calma';
      }
    }

    // Calculate confidence based on keyword matches and mood consistency
    const totalKeywords = positiveCount + negativeCount + neutralCount;
    const confidence = Math.min(95, Math.max(60, 60 + totalKeywords * 5 + moodData.mood * 2));

    // Calculate intensity based on mood score and wellness metrics
    const avgWellness =
      (moodData.wellness.sleep +
        moodData.wellness.energy +
        (10 - moodData.wellness.stress) +
        moodData.wellness.social) /
      4;
    const intensity = Math.round((moodData.mood + avgWellness) / 2);

    // Get suggestions based on sentiment
    const baseSuggestions = this.suggestions[sentiment];
    const additionalSuggestions = this.getAdditionalSuggestions(moodData);
    const suggestions = [...baseSuggestions, ...additionalSuggestions].slice(0, 4);

    // Extract keywords from description
    const allKeywords = [...this.positiveKeywords, ...this.negativeKeywords, ...this.neutralKeywords];
    const foundKeywords = allKeywords.filter((keyword) => description.includes(keyword));

    return {
      emotion,
      confidence: Math.round(confidence),
      sentiment,
      suggestions,
      keywords: foundKeywords.slice(0, 5),
      intensity: Math.min(10, Math.max(1, intensity)),
    };
  }

  private getAdditionalSuggestions(moodData: MoodData): string[] {
    const suggestions: string[] = [];

    // Sleep-related suggestions
    if (moodData.wellness.sleep < 5) {
      suggestions.push('Considera mejorar tu rutina de sueño para un mejor descanso');
    }

    // Stress-related suggestions
    if (moodData.wellness.stress > 7) {
      suggestions.push('Practica técnicas de relajación para manejar el estrés');
    }

    // Energy-related suggestions
    if (moodData.wellness.energy < 5) {
      suggestions.push('El ejercicio regular puede aumentar tus niveles de energía');
    }

    // Social-related suggestions
    if (moodData.wellness.social < 5) {
      suggestions.push('Conecta con amigos o familia para mejorar tu bienestar social');
    }

    // Habit-based suggestions
    if (!moodData.habits.exercise) {
      suggestions.push('Incluye actividad física en tu rutina diaria');
    }

    if (!moodData.habits.meditation) {
      suggestions.push('La meditación diaria puede mejorar tu bienestar mental');
    }

    if (!moodData.habits.gratitude) {
      suggestions.push('Practica la gratitud diaria para una perspectiva más positiva');
    }

    return suggestions;
  }

  // Generate personalized insights based on mood patterns
  async generateInsights(moodHistory: MoodData[]): Promise<string[]> {
    if (moodHistory.length < 3) {
      return ['Necesitas más datos para generar insights personalizados'];
    }

    const insights: string[] = [];

    // Calculate average mood
    const avgMood = moodHistory.reduce((sum, mood) => sum + mood.mood, 0) / moodHistory.length;

    if (avgMood >= 4) {
      insights.push('Tu estado de ánimo general es muy positivo. ¡Sigue así!');
    } else if (avgMood <= 2) {
      insights.push('Has estado experimentando emociones difíciles. Considera buscar apoyo profesional.');
    } else {
      insights.push('Tu estado de ánimo se mantiene estable. Esto es una buena base para el crecimiento.');
    }

    // Analyze patterns
    const recentMoods = moodHistory.slice(-7).map((m) => m.mood);
    const isImproving = recentMoods[recentMoods.length - 1] > recentMoods[0];

    if (isImproving) {
      insights.push('Has mostrado una tendencia positiva en los últimos días.');
    } else if (recentMoods[recentMoods.length - 1] < recentMoods[0]) {
      insights.push('Has experimentado una disminución en tu estado de ánimo recientemente.');
    }

    // Activity patterns
    const allActivities = moodHistory.flatMap((m) => m.activities);
    const activityCounts = allActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonActivity = Object.entries(activityCounts).sort(([, a], [, b]) => b - a)[0];

    if (mostCommonActivity) {
      insights.push(
        `Tu actividad más frecuente es ${mostCommonActivity[0]}, lo cual parece ser importante para tu bienestar.`
      );
    }

    return insights;
  }
}

export const aiService = new AIService();
