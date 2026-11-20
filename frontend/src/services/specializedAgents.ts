import { requestAi } from './aiApi';
import { MoodAnalysisRequestData } from '../utils/moodAnalysisPayload';
import { MoodAnalysisResult, normalizeMoodAnalysis } from '../utils/moodAnalysisResult';

export type { MoodAnalysisResult } from '../utils/moodAnalysisResult';

export const empatheticCompanionAgent = {
  chat: (message: string, consentVersion: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'mia', message, consentVersion }),
};

export const reflectionGuideAgent = {
  chat: (message: string, consentVersion: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'reflection', message, consentVersion }),
};

export class MoodAnalyzerAgent {
  async analyzeMood(moodData: MoodAnalysisRequestData, consentVersion: string): Promise<MoodAnalysisResult> {
    if (!moodData.moodLogs.length) {
      throw new Error('No hay suficientes registros de ánimo para generar un análisis.');
    }
    const response = await requestAi<unknown>({
      task: 'mood-analysis',
      moodData,
      consentVersion,
    });
    return normalizeMoodAnalysis(response);
  }
}

export const moodAnalyzerAgent = new MoodAnalyzerAgent();
