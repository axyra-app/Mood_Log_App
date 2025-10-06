/**
 * Common types for Mood Log App
 * Replaces generic 'any' types with specific interfaces
 */

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Generic Error
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Generic Form Data
export interface FormData {
  [key: string]: string | number | boolean | File | null | undefined;
}

// Generic User Input
export interface UserInput {
  value: string;
  isValid: boolean;
  error?: string;
}

// Generic Loading State
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: unknown;
}

// Generic Modal Props
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Generic Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  isDarkMode?: boolean;
}

// Generic Service Response
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Generic Event Handler
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

// Generic Async Function
export type AsyncFunction<T = unknown, R = unknown> = (params: T) => Promise<R>;
