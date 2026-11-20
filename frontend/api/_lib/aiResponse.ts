import { normalizeJournalAnalysis } from '../../src/utils/journalAnalysisResult.ts';
import type { JournalAnalysisResult } from '../../src/utils/journalAnalysisResult.ts';
import { normalizeMoodAnalysis } from '../../src/utils/moodAnalysisResult.ts';
import type { MoodAnalysisResult } from '../../src/utils/moodAnalysisResult.ts';

export type AiResponseTask = 'chat' | 'journal-analysis' | 'mood-analysis';
export type NormalizedAiResult = string | JournalAnalysisResult | MoodAnalysisResult;

export const MAX_CHAT_RESPONSE_CHARACTERS = 8_000;

export const normalizeAiProviderResult = (
  task: AiResponseTask,
  value: unknown,
): NormalizedAiResult => {
  if (task === 'chat') {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('La respuesta de chat no tiene un formato válido.');
    }
    if (value.length > MAX_CHAT_RESPONSE_CHARACTERS) {
      throw new Error('La respuesta de chat supera el tamaño permitido.');
    }
    return value.trim();
  }
  if (task === 'journal-analysis') return normalizeJournalAnalysis(value);
  return normalizeMoodAnalysis(value);
};
