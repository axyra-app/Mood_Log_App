import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import React from 'react';

interface MoodAnalysis {
  summary: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  nextSteps: string[];
  moodTrend: 'improving' | 'stable' | 'declining';
  keyFactors: string[];
}

interface MoodAnalysisDisplayProps {
  analysis: MoodAnalysis | null;
  analyzing: boolean;
}

const MoodAnalysisDisplay: React.FC<MoodAnalysisDisplayProps> = ({ analysis, analyzing }) => {
  if (analyzing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900">Analizando tu estado de ánimo...</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-sm text-gray-600 ml-2">Procesando datos con IA...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Estado de Ánimo</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(analysis.moodTrend)}
          <span className="text-sm font-medium text-gray-600 capitalize">
            {analysis.moodTrend === 'improving' ? 'Mejorando' : 
             analysis.moodTrend === 'declining' ? 'Declinando' : 'Estable'}
          </span>
        </div>
      </div>

      {/* Risk Level */}
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getRiskColor(analysis.riskLevel)}`}>
        {getRiskIcon(analysis.riskLevel)}
        <span className="text-sm font-medium">
          Riesgo: {analysis.riskLevel === 'high' ? 'Alto' : 
                  analysis.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
        </span>
      </div>

      {/* Summary */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-2">Resumen</h4>
        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Patterns */}
      {analysis.patterns.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
            Patrones Identificados
          </h4>
          <ul className="space-y-2">
            {analysis.patterns.map((pattern, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Insights Clave
          </h4>
          <ul className="space-y-2">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Factors */}
      {analysis.keyFactors.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Factores Clave</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyFactors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Recomendaciones
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {analysis.nextSteps.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Próximos Pasos</h4>
          <ul className="space-y-2">
            {analysis.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoodAnalysisDisplay;
