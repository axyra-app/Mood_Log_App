// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'psychologist';
  createdAt: Date;
  updatedAt: Date;
}

// Psychologist Types
export interface Psychologist extends User {
  role: 'psychologist';
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  rating: number;
  patientsCount: number;
  isAvailable: boolean;
}

// Mood Log Types
export interface MoodLog {
  id: string;
  userId: string;
  mood: number; // 1-5 scale
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

// Chat Types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: ChatMessage;
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
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
  role: 'user' | 'psychologist';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  // Psychologist specific fields
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  bio?: string;
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

