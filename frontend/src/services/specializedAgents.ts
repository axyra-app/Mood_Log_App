import { requestAi } from './aiApi';
import { MoodAnalysisRequestData } from '../utils/moodAnalysisPayload';
import { MoodAnalysisResult, normalizeMoodAnalysis } from '../utils/moodAnalysisResult';

export type { MoodAnalysisResult } from '../utils/moodAnalysisResult';

export const empatheticCompanionAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'mia', message }),
};

export const reflectionGuideAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'reflection', message }),
};

export class MoodAnalyzerAgent {
  async analyzeMood(moodData: MoodAnalysisRequestData): Promise<MoodAnalysisResult> {
    if (!moodData.moodLogs.length) {
      throw new Error('No hay suficientes registros de ánimo para generar un análisis.');
    }
    const response = await requestAi<unknown>({
      task: 'mood-analysis',
      moodData,
    });
    return normalizeMoodAnalysis(response);
  }
}

export const moodAnalyzerAgent = new MoodAnalyzerAgent();
