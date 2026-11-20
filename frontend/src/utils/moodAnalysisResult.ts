export interface MoodAnalysisResult {
  summary: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  keyFactors: string[];
}

const MAX_SUMMARY_CHARACTERS = 2_000;
const MAX_LIST_ITEMS = 8;
const MAX_LIST_ITEM_CHARACTERS = 600;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const cleanText = (value: string): string => value.replace(CONTROL_CHARACTERS, '').trim();

const toTextList = (value: unknown): string[] => {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : [];

  return items.slice(0, MAX_LIST_ITEMS)
    .map((item): string => {
      if (typeof item === 'string') {
        return cleanText(item).replace(/^(?:[-*•→]|\d+[.)])\s*/, '');
      }
      if (!item || typeof item !== 'object' || Array.isArray(item)) return '';

      const record = item as Record<string, unknown>;
      for (const key of ['description', 'actionable', 'title', 'name']) {
        if (typeof record[key] === 'string' && record[key].trim()) return cleanText(record[key]);
      }
      return '';
    })
    .filter((item) => item.length > 0 && item.length <= MAX_LIST_ITEM_CHARACTERS);
};

export const normalizeMoodAnalysis = (value: unknown): MoodAnalysisResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('El análisis recibido no tiene un formato válido. Inténtalo de nuevo.');
  }

  const result = value as Record<string, unknown>;
  if (typeof result.summary !== 'string' || !cleanText(result.summary)) {
    throw new Error('El análisis recibido está incompleto. Inténtalo de nuevo.');
  }
  const summary = cleanText(result.summary);
  if (summary.length > MAX_SUMMARY_CHARACTERS) {
    throw new Error('El análisis recibido supera el tamaño permitido. Inténtalo de nuevo.');
  }
  return {
    summary,
    patterns: toTextList(result.patterns),
    insights: toTextList(result.insights),
    recommendations: toTextList(result.recommendations),
    nextSteps: toTextList(result.nextSteps),
    keyFactors: toTextList(result.keyFactors),
  };
};
