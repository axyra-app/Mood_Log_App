// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user';
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mood Log Types
export interface MoodLog {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleep: number; // 1-10 scale
  notes: string;
  activities: string[];
  emotions: string[];
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

// AI Analysis Types
export interface AIAnalysis {
  primaryEmotion: string;
  confidence: number; // 0-100
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions: string[];
  patterns: string[];
}

// Statistics Types
export interface MoodStatistics {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  weeklyData: {
    date: string;
    mood: number;
    energy: number;
    stress: number;
  }[];
  monthlyData: {
    month: string;
    averageMood: number;
    totalLogs: number;
  }[];
  patterns: {
    bestDay: string;
    worstDay: string;
    commonActivities: string[];
    commonEmotions: string[];
  };
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'milestone' | 'special';
  requirement: number;
  reward: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

// Push Notification Types
export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reminder' | 'mood_check' | 'general';
  data?: any;
  read: boolean;
  sentAt: Date;
  scheduledFor?: Date;
}

export interface NotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  moodCheckReminders: boolean;
  weeklyReports: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  timezone: string;
}

// Advanced Analytics Types
export interface MoodTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    date: string;
    mood: number;
    energy: number;
    stress: number;
    sleep: number;
    activities: string[];
    emotions: string[];
  }[];
  averageMood: number;
  trend: 'improving' | 'declining' | 'stable';
  volatility: number; // 0-1 scale
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  intensity: number;
  triggers: string[];
  timeOfDay: string[];
  dayOfWeek: string[];
  correlation: {
    activity: string;
    strength: number; // -1 to 1
  }[];
}

export interface WellnessInsights {
  overallScore: number; // 0-100
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  riskFactors: string[];
  protectiveFactors: string[];
  patterns: EmotionalPattern[];
  trends: MoodTrend[];
  goals: {
    shortTerm: string[];
    longTerm: string[];
  };
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    shareData: boolean;
    anonymousMode: boolean;
    dataRetention: number; // days
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

// Journal Types (Notion-style)
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood?: number; // 1-10 scale
  energy?: number; // 1-10 scale
  stress?: number; // 1-10 scale
  sleep?: number; // 1-10 scale
  activities: string[];
  emotions: string[];
  aiSuggestions?: string[];
  aiAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    themes: string[];
    insights: string[];
    recommendations: string[];
    summary: string;
  };
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: 'daily' | 'weekly' | 'monthly' | 'reflection' | 'gratitude' | 'goal-setting' | 'mood' | 'stress' | 'goals' | 'relationships';
  isDefault: boolean;
  createdBy: string; // userId or 'system'
  createdAt: Date;
}

export interface JournalPrompt {
  id: string;
  title: string;
  content: string;
  category: 'daily' | 'reflection' | 'gratitude' | 'goal-setting' | 'emotional' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  tags: string[];
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}
