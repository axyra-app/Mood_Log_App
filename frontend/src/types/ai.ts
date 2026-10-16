export interface AIRecommendation {
  type: 'energy' | 'stress' | 'sleep' | 'mood' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: string;
  category: string;
}

export interface MoodAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: AIRecommendation[];
  moodTrend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  emotionalRegulation?: {
    title: string;
    description: string;
    strategies: string[];
  };
  wellBeingMaintenance?: {
    title: string;
    description: string;
    strategies: string[];
  };
  textualAnalysis?: {
    title: string;
    description: string;
    insights: string[];
    recommendations: string[];
  };
}
