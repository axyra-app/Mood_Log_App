// Mood Flow Service - Handles the new mood logging flow
// Manages the process from diary entry to mood registration with AI analysis and fallback questions

export interface DiaryEntry {
  text: string;
  timestamp: Date;
  hasExplicitMood: boolean;
  explicitMood?: number;
  aiAnalysis?: {
    emotion: string;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    canConclude: boolean;
  };
  fallbackQuestions?: string[];
  currentQuestionIndex?: number;
  userResponses?: string[];
  finalMood?: number;
  isComplete: boolean;
}

export interface MoodFlowState {
  currentStep: 'diary' | 'mood_selection' | 'ai_analysis' | 'fallback_questions' | 'complete';
  diaryEntry: DiaryEntry;
  showMoodSelector: boolean;
  showAiAnalysis: boolean;
  showFallbackQuestions: boolean;
}

class MoodFlowService {
  private fallbackQuestions = [
    '¿Cómo te sientes en este momento? (1-5)',
    '¿Qué tan satisfecho estás con tu día? (1-5)',
    '¿Cómo calificarías tu nivel de energía? (1-5)',
    '¿Qué tan positivo te sientes sobre el futuro? (1-5)',
    '¿Cómo te sientes respecto a tus relaciones? (1-5)',
    '¿Qué tan motivado te sientes? (1-5)',
    '¿Cómo calificarías tu bienestar general? (1-5)',
    '¿Qué tan tranquilo te sientes? (1-5)',
  ];

  private motivationalMessages = [
    'Entiendo que puede ser difícil expresar cómo te sientes. Cada paso cuenta para tu bienestar.',
    'No hay respuestas correctas o incorrectas. Solo queremos entender mejor cómo te sientes.',
    'Tu bienestar es importante. Ayúdanos a ayudarte registrando tu estado de ánimo.',
    'Cada entrada nos ayuda a crear un mejor perfil de tu bienestar emocional.',
    'Es normal tener días difíciles. Registrar cómo te sientes es el primer paso para mejorar.',
  ];

  createDiaryEntry(text: string): DiaryEntry {
    return {
      text,
      timestamp: new Date(),
      hasExplicitMood: false,
      isComplete: false,
    };
  }

  shouldShowMoodSelector(diaryEntry: DiaryEntry): boolean {
    return !diaryEntry.hasExplicitMood && diaryEntry.text.length > 0;
  }

  setExplicitMood(diaryEntry: DiaryEntry, mood: number): DiaryEntry {
    return {
      ...diaryEntry,
      hasExplicitMood: true,
      explicitMood: mood,
      finalMood: mood,
      isComplete: true,
    };
  }

  async analyzeWithAI(diaryEntry: DiaryEntry): Promise<DiaryEntry> {
    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const text = diaryEntry.text.toLowerCase();

    // Simple keyword-based analysis
    const positiveKeywords = [
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
    const negativeKeywords = [
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
    const neutralKeywords = [
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

    const positiveCount = positiveKeywords.filter((keyword) => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter((keyword) => text.includes(keyword)).length;
    const neutralCount = neutralKeywords.filter((keyword) => text.includes(keyword)).length;

    let sentiment: 'positive' | 'negative' | 'neutral';
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    // Determine if AI can conclude with confidence
    const totalKeywords = positiveCount + negativeCount + neutralCount;
    const confidence = Math.min(95, Math.max(40, 40 + totalKeywords * 8));
    const canConclude = confidence >= 70 && totalKeywords >= 2;

    let emotion: string;
    if (sentiment === 'positive') {
      emotion = positiveCount >= 3 ? 'Felicidad' : 'Tranquilidad';
    } else if (sentiment === 'negative') {
      emotion = negativeCount >= 3 ? 'Tristeza' : 'Ansiedad';
    } else {
      emotion = 'Calma';
    }

    // Convert sentiment to mood score (1-5)
    let moodScore: number;
    if (sentiment === 'positive') {
      moodScore = confidence >= 80 ? 5 : 4;
    } else if (sentiment === 'negative') {
      moodScore = confidence >= 80 ? 1 : 2;
    } else {
      moodScore = 3;
    }

    return {
      ...diaryEntry,
      aiAnalysis: {
        emotion,
        confidence,
        sentiment,
        canConclude,
      },
      finalMood: canConclude ? moodScore : undefined,
      isComplete: canConclude,
    };
  }

  generateFallbackQuestions(diaryEntry: DiaryEntry): DiaryEntry {
    const numQuestions = Math.min(3, this.fallbackQuestions.length);
    const selectedQuestions = this.fallbackQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

    return {
      ...diaryEntry,
      fallbackQuestions: selectedQuestions,
      currentQuestionIndex: 0,
      userResponses: [],
    };
  }

  answerFallbackQuestion(diaryEntry: DiaryEntry, answer: string): DiaryEntry {
    const responses = [...(diaryEntry.userResponses || []), answer];
    const nextIndex = (diaryEntry.currentQuestionIndex || 0) + 1;

    let isComplete = false;
    let finalMood: number | undefined;

    if (nextIndex >= (diaryEntry.fallbackQuestions?.length || 0)) {
      // Calculate final mood from responses
      const moodScores = responses
        .map((response) => {
          const match = response.match(/(\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((score) => score !== null) as number[];

      if (moodScores.length > 0) {
        finalMood = Math.round(moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length);
        isComplete = true;
      }
    }

    return {
      ...diaryEntry,
      userResponses: responses,
      currentQuestionIndex: nextIndex,
      finalMood,
      isComplete,
    };
  }

  getMotivationalMessage(): string {
    return this.motivationalMessages[Math.floor(Math.random() * this.motivationalMessages.length)];
  }

  shouldDiscardEntry(diaryEntry: DiaryEntry): boolean {
    return (
      !diaryEntry.isComplete &&
      diaryEntry.text.length > 0 &&
      !diaryEntry.hasExplicitMood &&
      !diaryEntry.aiAnalysis?.canConclude &&
      (diaryEntry.userResponses?.length || 0) === 0
    );
  }

  getCurrentStep(diaryEntry: DiaryEntry): MoodFlowState['currentStep'] {
    if (diaryEntry.isComplete) return 'complete';
    if (diaryEntry.hasExplicitMood) return 'complete';
    if (diaryEntry.fallbackQuestions && diaryEntry.currentQuestionIndex !== undefined) return 'fallback_questions';
    if (diaryEntry.aiAnalysis) return 'ai_analysis';
    if (diaryEntry.text.length > 0) return 'mood_selection';
    return 'diary';
  }
}

export const moodFlowService = new MoodFlowService();
