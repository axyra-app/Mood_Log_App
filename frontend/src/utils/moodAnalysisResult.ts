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
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : [];

  return items
    .map((item): string => {
      if (typeof item === 'string') {
        return item.trim().replace(/^(?:[-*•→]|\d+[.)])\s*/, '');
      }
      if (!item || typeof item !== 'object' || Array.isArray(item)) return '';

      const record = item as Record<string, unknown>;
      for (const key of ['description', 'actionable', 'title', 'name']) {
        if (typeof record[key] === 'string' && record[key].trim()) return record[key].trim();
      }
      return '';
    })
    .filter(Boolean);
};

export const normalizeMoodAnalysis = (value: unknown): MoodAnalysisResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('El análisis recibido no tiene un formato válido. Inténtalo de nuevo.');
  }

  const result = value as Record<string, unknown>;
  if (typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('El análisis recibido está incompleto. Inténtalo de nuevo.');
  }
  if (result.riskLevel !== 'low' && result.riskLevel !== 'medium' && result.riskLevel !== 'high') {
    throw new Error('El nivel de riesgo recibido no es válido. Inténtalo de nuevo.');
  }
  if (
    result.moodTrend !== 'improving'
    && result.moodTrend !== 'stable'
    && result.moodTrend !== 'declining'
  ) {
    throw new Error('La tendencia de ánimo recibida no es válida. Inténtalo de nuevo.');
  }

  return {
    summary: result.summary.trim(),
    patterns: toTextList(result.patterns),
    insights: toTextList(result.insights),
    recommendations: toTextList(result.recommendations),
    riskLevel: result.riskLevel,
    nextSteps: toTextList(result.nextSteps),
    moodTrend: result.moodTrend,
    keyFactors: toTextList(result.keyFactors),
    interventionStrategies: toTextList(result.interventionStrategies),
    wellnessPlan: toTextList(result.wellnessPlan),
  };
};
