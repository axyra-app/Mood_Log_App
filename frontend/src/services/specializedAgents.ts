import { requestAi } from './aiApi';

export const empatheticCompanionAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'mia', message }),
};

export const reflectionGuideAgent = {
  chat: (message: string): Promise<string> =>
    requestAi<string>({ task: 'chat', assistantId: 'reflection', message }),
};

// 🧠 ANALISTA DE ESTADO DE ÁNIMO INTELIGENTE
export class MoodAnalyzerAgent {
  async analyzeMood(moodData: any): Promise<any> {
    if (!moodData.moodLogs || moodData.moodLogs.length === 0) {
      return {
        summary: 'No hay suficientes datos de estado de ánimo para realizar un análisis completo. Se recomienda registrar más estados de ánimo para obtener insights más precisos.',
        patterns: ['Patrón: Datos insuficientes para identificar patrones específicos'],
        insights: ['Insight: Necesitas más registros para un análisis profundo'],
        recommendations: [
          'Registra tu estado de ánimo diariamente durante al menos una semana',
          'Incluye notas detalladas sobre tu día y emociones',
          'Mantén un registro consistente para identificar patrones'
        ],
        riskLevel: 'low',
        nextSteps: ['Continúa registrando tu estado de ánimo regularmente'],
        moodTrend: 'stable',
        keyFactors: ['Factor: Falta de datos suficientes para análisis']
      };
    }
    return requestAi<Record<string, unknown>>({
      task: 'mood-analysis',
      moodData,
    });
  }
}

export const moodAnalyzerAgent = new MoodAnalyzerAgent();
