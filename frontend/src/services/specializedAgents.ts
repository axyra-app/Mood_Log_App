import { requestAi } from './aiApi';
import { MoodAnalysisRequestData } from '../utils/moodAnalysisPayload';

export const empatheticCompanionAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'mia', message }),
};

export const reflectionGuideAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'reflection', message }),
};

// 🧠 ANALISTA DE ESTADO DE ÁNIMO INTELIGENTE
export interface MoodAnalysisResult {
  summary: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  nextSteps: string[];
  moodTrend: 'improving' | 'stable' | 'declining';
  keyFactors: string[];
  interventionStrategies: string[];
  wellnessPlan: string[];
}

const toTextList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): string => {
      if (typeof item === 'string') return item.trim();
      if (!item || typeof item !== 'object' || Array.isArray(item)) return '';

      const record = item as Record<string, unknown>;
      for (const key of ['description', 'actionable', 'title', 'name']) {
        if (typeof record[key] === 'string' && record[key].trim()) return record[key].trim();
      }
      return '';
    })
    .filter(Boolean);
};

const normalizeMoodAnalysis = (value: unknown): MoodAnalysisResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('El análisis recibido no tiene un formato válido. Inténtalo de nuevo.');
  }

  const result = value as Record<string, unknown>;
  if (typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('El análisis recibido está incompleto. Inténtalo de nuevo.');
  }

  return {
    summary: result.summary.trim(),
    patterns: toTextList(result.patterns),
    insights: toTextList(result.insights),
    recommendations: toTextList(result.recommendations),
    riskLevel: result.riskLevel === 'medium' || result.riskLevel === 'high' ? result.riskLevel : 'low',
    nextSteps: toTextList(result.nextSteps),
    moodTrend: result.moodTrend === 'improving' || result.moodTrend === 'declining'
      ? result.moodTrend
      : 'stable',
    keyFactors: toTextList(result.keyFactors),
    interventionStrategies: toTextList(result.interventionStrategies),
    wellnessPlan: toTextList(result.wellnessPlan),
  };
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
