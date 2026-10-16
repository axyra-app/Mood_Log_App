import { toDate } from './moodMetrics';

const MAX_ANALYSIS_RECORDS = 60;
const MAX_ANALYSIS_PAYLOAD_LENGTH = 18_000;

export interface MoodAnalysisLog {
  date: string;
  mood: number;
  energy?: number;
  stress?: number;
  sleep?: number;
  emotions: string[];
  activities: string[];
  notes: string;
}

export interface MoodAnalysisRequestData {
  period: string;
  moodLogs: MoodAnalysisLog[];
}

export interface MoodAnalysisSourceLog {
  mood: number;
  createdAt?: unknown;
  date?: unknown;
  energy?: number;
  stress?: number;
  sleep?: number;
  emotions?: string[];
  activities?: string[];
  notes?: string;
}

export interface PreparedMoodAnalysis {
  moodData: MoodAnalysisRequestData;
  totalCount: number;
  includedCount: number;
}

const trimList = (values: string[] | undefined): string[] =>
  (values || [])
    .filter((value): value is string => typeof value === 'string')
    .slice(0, 4)
    .map((value) => value.trim().slice(0, 32))
    .filter(Boolean);

export const prepareMoodAnalysis = (logs: MoodAnalysisSourceLog[], period: string): PreparedMoodAnalysis => {
  const orderedLogs = logs
    .map((log) => ({ log, date: toDate(log.createdAt ?? log.date) }))
    .filter((item): item is { log: MoodAnalysisSourceLog; date: Date } => item.date !== null)
    .sort((first, second) => second.date.getTime() - first.date.getTime());
  const totalCount = orderedLogs.length;
  const moodLogs: MoodAnalysisLog[] = orderedLogs
    .slice(0, MAX_ANALYSIS_RECORDS)
    .map(({ log, date }) => ({
      date: date.toISOString(),
      mood: log.mood,
      ...(Number.isFinite(log.energy) ? { energy: log.energy } : {}),
      ...(Number.isFinite(log.stress) ? { stress: log.stress } : {}),
      ...(Number.isFinite(log.sleep) ? { sleep: log.sleep } : {}),
      emotions: trimList(log.emotions),
      activities: trimList(log.activities),
      notes: typeof log.notes === 'string' ? log.notes.trim().slice(0, 180) : '',
    }));

  const moodData: MoodAnalysisRequestData = { period, moodLogs };
  const serializedLength = (): number => JSON.stringify(moodData).length;

  if (serializedLength() > MAX_ANALYSIS_PAYLOAD_LENGTH) {
    moodLogs.forEach((log) => {
      log.notes = log.notes.slice(0, 60);
    });
  }
  if (serializedLength() > MAX_ANALYSIS_PAYLOAD_LENGTH) {
    moodLogs.forEach((log) => {
      log.notes = '';
    });
  }
  while (serializedLength() > MAX_ANALYSIS_PAYLOAD_LENGTH && moodLogs.length > 1) {
    moodLogs.pop();
  }

  if (serializedLength() > MAX_ANALYSIS_PAYLOAD_LENGTH) {
    throw new Error('No se pudieron preparar los registros para el análisis. Inténtalo de nuevo.');
  }

  return {
    moodData,
    totalCount,
    includedCount: moodLogs.length,
  };
};
