import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, Brain, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMoodFlow } from '../hooks/useMoodFlow';
import { useOffline } from '../hooks/useOffline';
import { db } from '../lib/firebase';
import { achievementService } from '../services/achievementService';
import { notificationService } from '../services/notificationService';
import OpenAIService from '../services/openaiService';
import AIAnalysis from './AIAnalysis';
import FallbackQuestions from './FallbackQuestions';
import MoodSelector from './MoodSelector';
import MoodSummary from './MoodSummary';

// MoodData interface removed as it's not needed in the new flow

const MoodForm = () => {
  const { userProfile } = useAuth();
  const { isOnline, saveOffline } = useOffline();
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

  const [diaryText, setDiaryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  // Removed validation schema and other unused variables for the new flow

  const handleDiarySubmit = async () => {
    if (diaryText.trim().length < 10) {
      setErrorMessage('Por favor, escribe al menos 10 caracteres sobre tu día.');
      return;
    }

    setErrorMessage('');
    startDiaryEntry(diaryText);

    // Automatically try AI analysis
    await analyzeWithAI();
  };

  const handleMoodSelect = (mood: number) => {
    setExplicitMood(mood);
  };

  const handleAIAccept = () => {
    // AI analysis is accepted, entry is complete
    setSuccessMessage('¡Estado de ánimo registrado exitosamente!');
  };

  const handleAIReject = () => {
    // Generate fallback questions
    generateFallbackQuestions();
  };

  const handleFallbackAnswer = (answer: string) => {
    answerFallbackQuestion(answer);
  };

  const handleFallbackComplete = () => {
    setSuccessMessage('¡Estado de ánimo registrado exitosamente!');
  };

  const handleDiscardEntry = () => {
    if (shouldDiscardEntry()) {
      setShowDiscardWarning(true);
    } else {
      resetFlow();
      setDiaryText('');
    }
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
        await addDoc(collection(db, 'moodLogs'), moodLogData);

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
      } else {
        // Save offline when not connected
        saveOffline(moodLogData);
        setSuccessMessage('¡Estado de ánimo guardado localmente! Se sincronizará cuando vuelvas a conectarte.');
      }

      // Reset form after successful save
      setTimeout(() => {
        resetFlow();
        setDiaryText('');
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error saving mood log:', error);
      setErrorMessage('Error al guardar tu estado de ánimo. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDiarySubmit();
  };

  // Removed toggleActivity function as it's not needed in the new flow

  const currentStep = getCurrentStep();

  return (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Registro de Estado de Ánimo</h2>
        <p className='text-gray-600'>Comparte tu día y te ayudamos a registrar cómo te sientes</p>
      </div>

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
                  resetFlow();
                  setDiaryText('');
                }}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Diary Entry */}
      {currentStep === 'diary' && (
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
            <div className='text-center mb-6'>
              <div className='flex items-center justify-center space-x-2 mb-2'>
                <FileText className='w-6 h-6 text-primary-600' />
                <h3 className='text-xl font-semibold text-gray-900'>Cuéntanos sobre tu día</h3>
              </div>
              <p className='text-gray-600'>
                Escribe libremente sobre lo que te ha pasado hoy, cómo te sientes, qué has hecho...
              </p>
            </div>

            <div>
              <textarea
                value={diaryText}
                onChange={(e) => setDiaryText(e.target.value)}
                className='input-field resize-none h-32'
                placeholder='Describe cómo ha sido tu día, qué has hecho, cómo te sientes...'
                maxLength={500}
              />
              <div className='flex justify-between items-center mt-2'>
                <span className='text-sm text-gray-500'>{diaryText.length}/500 caracteres</span>
                {diaryText.length > 0 && (
                  <button
                    type='button'
                    onClick={handleDiscardEntry}
                    className='text-sm text-gray-500 hover:text-red-600 font-medium'
                  >
                    Descartar
                  </button>
                )}
              </div>
            </div>

            <div className='mt-6'>
              <button
                type='submit'
                disabled={diaryText.trim().length < 10 || isAnalyzing}
                className='w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isAnalyzing ? (
                  <div className='flex items-center justify-center space-x-2'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Analizando...</span>
                  </div>
                ) : (
                  <div className='flex items-center justify-center space-x-2'>
                    <Brain className='w-5 h-5' />
                    <span>Continuar</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 2: Mood Selection */}
      {currentStep === 'mood_selection' && diaryEntry && (
        <MoodSelector onMoodSelect={handleMoodSelect} onSkip={() => analyzeWithAI()} isLoading={isAnalyzing} />
      )}

      {/* Step 3: AI Analysis */}
      {currentStep === 'ai_analysis' && diaryEntry?.aiAnalysis && (
        <AIAnalysis
          analysis={diaryEntry.aiAnalysis}
          onAccept={handleAIAccept}
          onReject={handleAIReject}
          isLoading={isProcessing}
        />
      )}

      {/* Step 4: Fallback Questions */}
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

      {/* Step 5: Summary and Save */}
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
            setDiaryText(diaryEntry.text);
          }}
          isLoading={saving}
        />
      )}

      {/* Advanced Options (Future Enhancement) */}
      {currentStep === 'complete' && (
        <div>
          <button
            type='button'
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium'
          >
            <TrendingUp className='w-4 h-4' />
            <span>Opciones Avanzadas (Próximamente)</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodForm;
