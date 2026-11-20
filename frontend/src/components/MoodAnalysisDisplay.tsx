import { Brain, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import React from 'react';
import Logo from './Logo';

interface MoodAnalysis {
  summary: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
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
          <Logo size="sm" showText={false} />
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Estado de Ánimo</h3>
        </div>
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
