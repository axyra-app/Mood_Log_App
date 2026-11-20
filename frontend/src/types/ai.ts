export interface MoodAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  textualAnalysis: {
    title: string;
    description: string;
    insights: string[];
    recommendations: string[];
  };
}
