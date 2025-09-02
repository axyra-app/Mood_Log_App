// Error Service for Mood Log App
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: any;
}

class ErrorService {
  private errors: AppError[] = [];

  // Create a standardized error
  createError(code: string, message: string, details?: any, context?: ErrorContext): AppError {
    const error: AppError = {
      code,
      message,
      details,
      timestamp: new Date(),
      userId: context?.userId,
      context: context?.component,
    };

    // Log error
    this.logError(error);

    return error;
  }

  // Log error to console and store locally
  private logError(error: AppError): void {
    console.error('App Error:', error);
    this.errors.push(error);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: any): string {
    // Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No se encontró una cuenta con este correo electrónico.';
        case 'auth/wrong-password':
          return 'La contraseña es incorrecta.';
        case 'auth/email-already-in-use':
          return 'Ya existe una cuenta con este correo electrónico.';
        case 'auth/weak-password':
          return 'La contraseña debe tener al menos 6 caracteres.';
        case 'auth/invalid-email':
          return 'El correo electrónico no es válido.';
        case 'auth/too-many-requests':
          return 'Demasiados intentos fallidos. Inténtalo más tarde.';
        case 'auth/network-request-failed':
          return 'Error de conexión. Verifica tu internet.';
        case 'auth/user-disabled':
          return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/requires-recent-login':
          return 'Por seguridad, necesitas iniciar sesión nuevamente.';
      }
    }

    // Firestore errors
    if (error.code && error.code.startsWith('firestore/')) {
      switch (error.code) {
        case 'firestore/permission-denied':
          return 'No tienes permisos para realizar esta acción.';
        case 'firestore/unavailable':
          return 'El servicio no está disponible. Inténtalo más tarde.';
        case 'firestore/deadline-exceeded':
          return 'La operación tardó demasiado. Inténtalo nuevamente.';
        case 'firestore/resource-exhausted':
          return 'Límite de uso excedido. Inténtalo más tarde.';
        case 'firestore/failed-precondition':
          return 'La operación falló debido a una condición previa.';
        case 'firestore/aborted':
          return 'La operación fue cancelada.';
        case 'firestore/out-of-range':
          return 'El valor está fuera del rango permitido.';
        case 'firestore/unimplemented':
          return 'Esta función no está implementada.';
        case 'firestore/internal':
          return 'Error interno del servidor.';
        case 'firestore/data-loss':
          return 'Se perdió información durante la operación.';
        case 'firestore/not-authenticated':
          return 'Necesitas iniciar sesión para continuar.';
      }
    }

    // Network errors
    if (error.message) {
      if (error.message.includes('Network Error')) {
        return 'Error de conexión. Verifica tu internet.';
      }
      if (error.message.includes('timeout')) {
        return 'La operación tardó demasiado. Inténtalo nuevamente.';
      }
      if (error.message.includes('Failed to fetch')) {
        return 'No se pudo conectar al servidor. Verifica tu conexión.';
      }
    }

    // Generic fallback
    return error.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.';
  }

  // Handle Firebase errors
  handleFirebaseError(error: any, context?: ErrorContext): AppError {
    const friendlyMessage = this.getUserFriendlyMessage(error);

    return this.createError(
      error.code || 'firebase/unknown',
      friendlyMessage,
      {
        originalError: error,
        firebaseError: true,
      },
      context
    );
  }

  // Handle network errors
  handleNetworkError(error: any, context?: ErrorContext): AppError {
    return this.createError(
      'network/error',
      this.getUserFriendlyMessage(error),
      {
        originalError: error,
        networkError: true,
      },
      context
    );
  }

  // Handle validation errors
  handleValidationError(message: string, field?: string, context?: ErrorContext): AppError {
    return this.createError(
      'validation/error',
      message,
      {
        field,
        validationError: true,
      },
      context
    );
  }

  // Handle authentication errors
  handleAuthError(error: any, context?: ErrorContext): AppError {
    return this.createError(
      error.code || 'auth/unknown',
      this.getUserFriendlyMessage(error),
      {
        originalError: error,
        authError: true,
      },
      context
    );
  }

  // Get recent errors
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errors.slice(-limit);
  }

  // Clear errors
  clearErrors(): void {
    this.errors = [];
  }

  // Check if error is retryable
  isRetryableError(error: any): boolean {
    const retryableCodes = [
      'firestore/unavailable',
      'firestore/deadline-exceeded',
      'firestore/resource-exhausted',
      'firestore/aborted',
      'auth/network-request-failed',
      'network/error',
    ];

    return (
      retryableCodes.includes(error.code) ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error')
    );
  }

  // Get retry delay based on error
  getRetryDelay(error: any, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  // Retry function with exponential backoff
  async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, context?: ErrorContext): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw this.handleFirebaseError(error, context);
        }

        const delay = this.getRetryDelay(error, attempt);
        console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Validate required fields
  validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter((field) => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw this.handleValidationError(
        `Los siguientes campos son requeridos: ${missingFields.join(', ')}`,
        missingFields.join(', ')
      );
    }
  }

  // Validate email format
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw this.handleValidationError('El formato del correo electrónico no es válido', 'email');
    }
  }

  // Validate password strength
  validatePassword(password: string): void {
    if (password.length < 6) {
      throw this.handleValidationError('La contraseña debe tener al menos 6 caracteres', 'password');
    }
  }

  // Validate mood value
  validateMood(mood: number): void {
    if (mood < 1 || mood > 5 || !Number.isInteger(mood)) {
      throw this.handleValidationError('El estado de ánimo debe ser un número entero entre 1 y 5', 'mood');
    }
  }

  // Validate wellness metrics
  validateWellness(wellness: any): void {
    const metrics = ['sleep', 'stress', 'energy', 'social'];

    for (const metric of metrics) {
      const value = wellness[metric];
      if (value < 1 || value > 10 || !Number.isInteger(value)) {
        throw this.handleValidationError(`La métrica ${metric} debe ser un número entero entre 1 y 10`, metric);
      }
    }
  }
}

export const errorService = new ErrorService();
