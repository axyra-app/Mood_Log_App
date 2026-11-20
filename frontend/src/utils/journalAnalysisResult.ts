export interface JournalAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  themes: string[];
  insights: string[];
  recommendations: string[];
  summary: string;
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
      for (const key of ['description', 'title', 'name']) {
        if (typeof record[key] === 'string' && record[key].trim()) return cleanText(record[key]);
      }
      return '';
    })
    .filter((item) => item.length > 0 && item.length <= MAX_LIST_ITEM_CHARACTERS);
};

export const normalizeJournalAnalysis = (value: unknown): JournalAnalysisResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('El análisis del diario no tiene un formato válido.');
  }

  const result = value as Record<string, unknown>;
  if (
    result.sentiment !== 'positive'
    && result.sentiment !== 'negative'
    && result.sentiment !== 'neutral'
  ) {
    throw new Error('El análisis del diario no contiene una categoría válida.');
  }
  if (typeof result.summary !== 'string' || !cleanText(result.summary)) {
    throw new Error('El análisis del diario está incompleto.');
  }
  const summary = cleanText(result.summary);
  if (summary.length > MAX_SUMMARY_CHARACTERS) {
    throw new Error('El resumen del diario supera el tamaño permitido.');
  }

  return {
    sentiment: result.sentiment,
    themes: toTextList(result.themes),
    insights: toTextList(result.insights),
    recommendations: toTextList(result.recommendations),
    summary,
  };
};
