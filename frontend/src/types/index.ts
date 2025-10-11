// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'psychologist';
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

// Psychologist Types
export interface Psychologist extends User {
  role: 'psychologist';
  professionalTitle?: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  cvUrl?: string;
  rating: number;
  patientsCount: number;
  isAvailable: boolean;
  workingHours?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  consultationFee?: number;
  languages?: string[];
  treatmentMethods?: string[];
}

// Patient Types
export interface Patient {
  id: string;
  userId: string;
  psychologistId: string;
  assignedAt: Date;
  status: 'active' | 'inactive' | 'discharged';
  diagnosis?: string;
  treatmentGoals: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastSessionDate?: Date;
  nextSessionDate?: Date;
  totalSessions: number;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Session Notes Types
export interface SessionNote {
  id: string;
  patientId: string;
  psychologistId: string;
  sessionDate: Date;
  sessionType: 'individual' | 'group' | 'family' | 'online';
  duration: number; // in minutes
  notes: string;
  observations: string;
  interventions: string[];
  homework?: string;
  nextSessionGoals: string[];
  moodBefore: number; // 1-10 scale
  moodAfter: number; // 1-10 scale
  progress: number; // 1-10 scale
  concerns: string[];
  strengths: string[];
  attachments?: string[]; // file URLs
  isConfidential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Treatment Plan Types
export interface TreatmentPlan {
  id: string;
  patientId: string;
  psychologistId: string;
  title: string;
  description: string;
  objectives: TreatmentObjective[];
  phases: TreatmentPhase[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentObjective {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface TreatmentPhase {
  id: string;
  title: string;
  description: string;
  duration: number; // in weeks
  activities: string[];
  goals: string[];
  completed: boolean;
  completedAt?: Date;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  psychologistId: string;
  appointmentDate: Date;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
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
  chatType: 'ai' | 'psychologist'; // Tipo de chat: IA o psicólogo real
  aiDoctorType?: 'general' | 'specialist'; // Tipo de doctor IA
  psychologistId?: string; // ID del psicólogo si es chat real
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
  type: 'appointment' | 'reminder' | 'message' | 'mood_check' | 'emergency' | 'general';
  data?: any;
  read: boolean;
  sentAt: Date;
  scheduledFor?: Date;
}

export interface NotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  appointmentReminders: boolean;
  moodCheckReminders: boolean;
  messageNotifications: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
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
  category: 'daily' | 'weekly' | 'monthly' | 'reflection' | 'gratitude' | 'goal-setting';
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

// Medical Report Types
export interface MedicalReport {
  id: string;
  patientId: string;
  psychologistId: string;
  reportType: 'initial' | 'progress' | 'discharge' | 'emergency';
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  recommendations?: string;
  nextAppointment?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientHistory {
  id: string;
  patientId: string;
  psychologistId: string;
  medicalHistory: {
    mentalHealth: string[];
    physicalHealth: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
  };
  psychologicalHistory: {
    previousTherapy: string[];
    diagnoses: string[];
    treatments: string[];
    hospitalizations: string[];
  };
  socialHistory: {
    education: string;
    occupation: string;
    relationships: string;
    livingSituation: string;
    substanceUse: string[];
  };
  createdAt: Date;
  updatedAt: Date;
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
