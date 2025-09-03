// Mood Flow Page - Complete mood logging flow
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIAnalysis from '../components/AIAnalysis';
import FallbackQuestions from '../components/FallbackQuestions';
import MoodSelector from '../components/MoodSelector';
import MoodSummary from '../components/MoodSummary';
import ProgressIndicator from '../components/ProgressIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useMoodFlow } from '../hooks/useMoodFlow';
import { useOffline } from '../hooks/useOffline';
import { db } from '../lib/firebase';
import { achievementService } from '../services/achievementService';
import { analyticsService } from '../services/analyticsService';
import { dailyCheckService } from '../services/dailyCheckService';
import { notificationService } from '../services/notificationService';
import { rateLimitService } from '../services/rateLimitService';

const MoodFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { isOnline, saveOffline } = useOffline();
  const [diaryText, setDiaryText] = useState('');
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
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
  } = useMoodFlow();

  // Get diary text from navigation state
  useEffect(() => {
    if (location.state?.diaryText && !diaryEntry) {
      setDiaryText(location.state.diaryText);
      // Start the mood flow with the diary text
      const entry = startDiaryEntry(location.state.diaryText);
      console.log('Started diary entry:', entry);

      // Automatically try AI analysis after a short delay
      setTimeout(() => {
        analyzeWithAI();
      }, 500);

      // Track mood flow start
      analyticsService.trackMoodFlowEvent('start', {
        textLength: location.state.diaryText.length,
      });
    } else if (location.state?.skipDiary && !diaryEntry) {
      // If skipping diary, start with empty text and go directly to mood selection
      setDiaryText('');
      const entry = startDiaryEntry('');
      console.log('Started mood flow without diary:', entry);

      // Track mood flow start without diary
      analyticsService.trackMoodFlowEvent('start', {
        textLength: 0,
        skippedDiary: true,
      });
    } else if (!location.state?.diaryText && !location.state?.skipDiary) {
      // If no diary text and not skipping, redirect back to diary entry
      console.warn('No diary text found in navigation state, redirecting to diary entry');
      navigate('/diary-entry', { replace: true });
    }

    // Track page view
    analyticsService.trackPageView('mood_flow');
  }, [location.state, diaryEntry, startDiaryEntry, analyzeWithAI, navigate]);

  const handleMoodSelect = (mood: number) => {
    setExplicitMood(mood);
  };

  const handleAIAccept = () => {
    // AI analysis is accepted, entry is complete
    // The flow will automatically move to summary
  };

  const handleAIReject = () => {
    // Generate fallback questions
    generateFallbackQuestions();
  };

  const handleFallbackAnswer = (answer: string) => {
    answerFallbackQuestion(answer);
  };

  const handleFallbackComplete = () => {
    // Flow will automatically move to summary
  };

  const handleDiscardEntry = () => {
    if (shouldDiscardEntry()) {
      setShowDiscardWarning(true);
    } else {
      navigate('/diary-entry');
    }
  };

  const handleGoBack = () => {
    navigate('/diary-entry');
  };

  const saveMoodLog = async () => {
    if (!userProfile?.uid) {
      setErrorMessage('Debes estar autenticado para guardar tu estado de ánimo');
      return;
    }

    if (!diaryEntry?.finalMood) {
      setErrorMessage('Debes seleccionar un estado de ánimo antes de guardar');
      return;
    }

    // Check rate limit
    if (!rateLimitService.isAllowed('mood-log')) {
      const remaining = rateLimitService.getRemaining('mood-log');
      const resetTime = rateLimitService.getResetTime('mood-log');
      const hoursLeft = Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60));
      setErrorMessage(
        `Has alcanzado el límite diario de registros de estado de ánimo. Inténtalo de nuevo en ${hoursLeft} horas.`
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const moodLogData = {
        userId: userProfile.uid,
        mood: diaryEntry.finalMood,
        description: diaryEntry.text,
        activities: [], // Will be added in advanced options
        wellness: {
          sleep: 5,
          stress: 5,
          energy: 5,
          social: 5,
        },
        habits: [],
        emotion: diaryEntry.aiAnalysis?.emotion || '',
        sentiment: diaryEntry.aiAnalysis?.sentiment || 'neutral',
        confidence: diaryEntry.aiAnalysis?.confidence || 0,
        intensity: 0,
        keywords: [],
        suggestions: [],
        hasExplicitMood: diaryEntry.hasExplicitMood,
        aiAnalysisUsed: !!diaryEntry.aiAnalysis,
        fallbackQuestionsUsed: !!diaryEntry.fallbackQuestions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (isOnline) {
        // Save to Firestore when online
        console.log('User UID:', userProfile.uid);
        console.log('Saving mood log to Firestore:', moodLogData);
        const docRef = await addDoc(collection(db, 'moodLogs'), moodLogData);
        console.log('Mood log saved successfully with ID:', docRef.id);

        // Check for new achievements
        const unlockedAchievements = await achievementService.checkAchievements(userProfile.uid, {
          mood: diaryEntry.finalMood,
          description: diaryEntry.text,
          activities: [],
          wellness: { sleep: 5, stress: 5, energy: 5, social: 5 },
          habits: { exercise: false, meditation: false, nutrition: false, gratitude: false },
        });

        // Create notifications for unlocked achievements
        for (const achievementId of unlockedAchievements) {
          const achievement = achievementService.getAchievementById(achievementId);
          if (achievement) {
            await notificationService.createAchievementNotification(
              userProfile.uid,
              achievement.name,
              achievement.description
            );
          }
        }

        setSuccessMessage('¡Estado de ánimo guardado exitosamente!');

        // Mark diary as completed for today
        await dailyCheckService.markDiaryCompleted(userProfile.uid);
      } else {
        // Save offline when not connected
        saveOffline(moodLogData);
        setSuccessMessage('¡Estado de ánimo guardado localmente! Se sincronizará cuando vuelvas a conectarte.');

        // Mark diary as completed locally
        await dailyCheckService.markDiaryCompleted(userProfile.uid);
      }

      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving mood log:', error);
      setErrorMessage('Error al guardar tu estado de ánimo. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const currentStep = getCurrentStep();

  // Debug logging
  console.log('Current step:', currentStep);
  console.log('Diary entry:', diaryEntry);

  if (!diaryText && !location.state?.skipDiary) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando tu entrada de diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4 sm:mb-8'>
          <button
            onClick={handleGoBack}
            className='flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm sm:text-base'
          >
            <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
            <span className='hidden sm:inline'>Volver al Diario</span>
            <span className='sm:hidden'>Volver</span>
          </button>

          <div className='text-center'>
            <h1 className='text-lg sm:text-2xl font-bold text-gray-900'>Estado de Ánimo</h1>
            <p className='text-sm sm:text-base text-gray-600 hidden sm:block'>Ayúdanos a entender cómo te sientes</p>
          </div>

          <button
            onClick={handleDiscardEntry}
            className='text-xs sm:text-sm text-gray-500 hover:text-red-600 font-medium transition-colors'
          >
            Descartar
          </button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={['diary', 'mood_selection', 'ai_analysis', 'fallback_questions', 'complete']}
          currentStep={currentStep}
          stepNames={['Diario', 'Selección', 'Análisis', 'Preguntas', 'Resumen']}
        />

        {/* Discard Warning Modal */}
        {showDiscardWarning && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl p-6 max-w-md mx-4'>
              <div className='flex items-center space-x-2 mb-4'>
                <AlertCircle className='w-6 h-6 text-yellow-600' />
                <h3 className='text-lg font-semibold text-gray-900'>¿Descartar entrada?</h3>
              </div>
              <p className='text-gray-600 mb-6'>
                Si descartas esta entrada, no se registrará para el seguimiento de tu estado de ánimo.
              </p>
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={() => setShowDiscardWarning(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium'
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowDiscardWarning(false);
                    navigate('/diary-entry');
                  }}
                  className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-5 h-5 bg-green-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs'>✓</span>
              </div>
              <p className='text-green-800 font-medium'>{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs'>!</span>
              </div>
              <p className='text-red-800 font-medium'>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Content based on current step */}
        <div className='space-y-6'>
          {/* Step 1: Mood Selection */}
          {currentStep === 'mood_selection' && diaryEntry && (
            <MoodSelector onMoodSelect={handleMoodSelect} onSkip={() => analyzeWithAI()} isLoading={isAnalyzing} />
          )}

          {/* Step 2: AI Analysis */}
          {currentStep === 'ai_analysis' && diaryEntry?.aiAnalysis && (
            <AIAnalysis
              analysis={diaryEntry.aiAnalysis}
              onAccept={handleAIAccept}
              onReject={handleAIReject}
              isLoading={isProcessing}
            />
          )}

          {/* Step 3: Fallback Questions */}
          {currentStep === 'fallback_questions' && diaryEntry?.fallbackQuestions && (
            <FallbackQuestions
              questions={diaryEntry.fallbackQuestions}
              currentQuestionIndex={diaryEntry.currentQuestionIndex || 0}
              onAnswer={handleFallbackAnswer}
              onPrevious={() => {
                // Go back to previous question - this would need to be implemented in the hook
                console.log('Previous question requested');
              }}
              onComplete={handleFallbackComplete}
              isLoading={isProcessing}
              motivationalMessage={getMotivationalMessage()}
            />
          )}

          {/* Step 4: Summary and Save */}
          {currentStep === 'complete' && diaryEntry && diaryEntry.finalMood && (
            <MoodSummary
              diaryEntry={{
                text: diaryEntry.text,
                timestamp: diaryEntry.timestamp,
                finalMood: diaryEntry.finalMood,
                hasExplicitMood: diaryEntry.hasExplicitMood,
                aiAnalysis: diaryEntry.aiAnalysis,
              }}
              onSave={saveMoodLog}
              onEdit={() => {
                // Go back to mood selection
                resetFlow();
                startDiaryEntry(diaryText);
              }}
              isLoading={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodFlow;
