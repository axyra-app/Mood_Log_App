// Custom hook for managing the mood logging flow
import { useCallback, useState } from 'react';
import { DiaryEntry, MoodFlowState, moodFlowService } from '../services/moodFlowService';

export const useMoodFlow = () => {
  const [diaryEntry, setDiaryEntry] = useState<DiaryEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startDiaryEntry = useCallback((text: string) => {
    const entry = moodFlowService.createDiaryEntry(text);
    setDiaryEntry(entry);
    return entry;
  }, []);

  const setExplicitMood = useCallback(
    (mood: number) => {
      if (!diaryEntry) return null;

      const updatedEntry = moodFlowService.setExplicitMood(diaryEntry, mood);
      setDiaryEntry(updatedEntry);
      return updatedEntry;
    },
    [diaryEntry]
  );

  const analyzeWithAI = useCallback(async () => {
    if (!diaryEntry) return null;

    setIsAnalyzing(true);
    try {
      const updatedEntry = await moodFlowService.analyzeWithAI(diaryEntry);
      setDiaryEntry(updatedEntry);
      return updatedEntry;
    } finally {
      setIsAnalyzing(false);
    }
  }, [diaryEntry]);

  const generateFallbackQuestions = useCallback(() => {
    if (!diaryEntry) return null;

    const updatedEntry = moodFlowService.generateFallbackQuestions(diaryEntry);
    setDiaryEntry(updatedEntry);
    return updatedEntry;
  }, [diaryEntry]);

  const answerFallbackQuestion = useCallback(
    (answer: string) => {
      if (!diaryEntry) return null;

      const updatedEntry = moodFlowService.answerFallbackQuestion(diaryEntry, answer);
      setDiaryEntry(updatedEntry);
      return updatedEntry;
    },
    [diaryEntry]
  );

  const getMotivationalMessage = useCallback(() => {
    return moodFlowService.getMotivationalMessage();
  }, []);

  const shouldDiscardEntry = useCallback(() => {
    if (!diaryEntry) return false;
    return moodFlowService.shouldDiscardEntry(diaryEntry);
  }, [diaryEntry]);

  const getCurrentStep = useCallback((): MoodFlowState['currentStep'] => {
    if (!diaryEntry) return 'diary';
    if (!diaryEntry.finalMood) return 'selection';
    if (!diaryEntry.aiAnalysis && !diaryEntry.hasExplicitMood) return 'analysis';
    if (diaryEntry.aiAnalysis?.confidence < 0.7 && !diaryEntry.fallbackQuestions) return 'questions';
    return 'complete';
  }, [diaryEntry]);

  const resetFlow = useCallback(() => {
    setDiaryEntry(null);
    setIsAnalyzing(false);
    setIsProcessing(false);
  }, []);

  const getFlowState = useCallback((): MoodFlowState => {
    if (!diaryEntry) {
      return {
        currentStep: 'diary',
        diaryEntry: moodFlowService.createDiaryEntry(''),
        showMoodSelector: false,
        showAiAnalysis: false,
        showFallbackQuestions: false,
      };
    }

    const currentStep = getCurrentStep();

    return {
      currentStep,
      diaryEntry,
      showMoodSelector: currentStep === 'mood_selection',
      showAiAnalysis: currentStep === 'ai_analysis',
      showFallbackQuestions: currentStep === 'fallback_questions',
    };
  }, [diaryEntry, getCurrentStep]);

  return {
    diaryEntry,
    isAnalyzing,
    isProcessing,
    startDiaryEntry,
    setExplicitMood,
    analyzeWithAI,
    generateFallbackQuestions,
    answerFallbackQuestion,
    getMotivationalMessage,
    shouldDiscardEntry,
    getCurrentStep,
    resetFlow,
    getFlowState,
    setIsProcessing,
  };
};
