import { FirebaseError } from 'firebase/app';

export interface ErrorInfo {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'firestore' | 'storage' | 'network' | 'validation' | 'system';
  userMessage: string;
  technicalMessage: string;
  suggestions?: string[];
}

export const ERROR_CODES: Record<string, ErrorInfo> = {
  // Errores de autenticación
  'auth/user-not-found': {
    code: 'auth/user-not-found',
    message: 'Usuario no encontrado',
    severity: 'medium',
    category: 'auth',
    userMessage: 'No existe una cuenta con este email. ¿Quieres registrarte?',
    technicalMessage: 'No user record found for the given email',
    suggestions: ['Verifica que el email esté correcto', 'Regístrate si no tienes cuenta'],
  },
  'auth/wrong-password': {
    code: 'auth/wrong-password',
    message: 'Contraseña incorrecta',
    severity: 'medium',
    category: 'auth',
    userMessage: 'La contraseña es incorrecta. ¿Olvidaste tu contraseña?',
    technicalMessage: 'The password is invalid for the given email',
    suggestions: ['Verifica tu contraseña', 'Usa "¿Olvidaste tu contraseña?"'],
  },
  'auth/email-already-in-use': {
    code: 'auth/email-already-in-use',
    message: 'Email ya en uso',
    severity: 'medium',
    category: 'auth',
    userMessage: 'Ya existe una cuenta con este email. ¿Quieres iniciar sesión?',
    technicalMessage: 'The email address is already in use by another account',
    suggestions: ['Inicia sesión si ya tienes cuenta', 'Usa un email diferente'],
  },
  'auth/weak-password': {
    code: 'auth/weak-password',
    message: 'Contraseña débil',
    severity: 'medium',
    category: 'auth',
    userMessage:
      'La contraseña es muy débil. Debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos.',
    technicalMessage: 'The password provided is too weak',
    suggestions: ['Usa una contraseña más fuerte', 'Incluye mayúsculas, minúsculas, números y símbolos'],
  },
  'auth/invalid-email': {
    code: 'auth/invalid-email',
    message: 'Email inválido',
    severity: 'low',
    category: 'auth',
    userMessage: 'El formato del email no es válido',
    technicalMessage: 'The email address is not valid',
    suggestions: ['Verifica el formato del email', 'Ejemplo: usuario@ejemplo.com'],
  },
  'auth/user-disabled': {
    code: 'auth/user-disabled',
    message: 'Usuario deshabilitado',
    severity: 'high',
    category: 'auth',
    userMessage: 'Esta cuenta ha sido deshabilitada. Contacta al soporte.',
    technicalMessage: 'The user account has been disabled by an administrator',
    suggestions: ['Contacta al soporte técnico'],
  },
  'auth/too-many-requests': {
    code: 'auth/too-many-requests',
    message: 'Demasiados intentos',
    severity: 'medium',
    category: 'auth',
    userMessage: 'Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo.',
    technicalMessage: 'Too many unsuccessful login attempts',
    suggestions: ['Espera 5-10 minutos', 'Verifica tus credenciales'],
  },
  'auth/network-request-failed': {
    code: 'auth/network-request-failed',
    message: 'Error de red',
    severity: 'high',
    category: 'network',
    userMessage: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
    technicalMessage: 'A network error occurred',
    suggestions: ['Verifica tu conexión a internet', 'Intenta de nuevo en unos minutos'],
  },
  'auth/popup-closed-by-user': {
    code: 'auth/popup-closed-by-user',
    message: 'Popup cerrado',
    severity: 'low',
    category: 'auth',
    userMessage: 'El proceso de autenticación fue cancelado.',
    technicalMessage: 'The popup has been closed by the user',
    suggestions: ['Intenta de nuevo', 'Asegúrate de permitir popups'],
  },
  'auth/cancelled-popup-request': {
    code: 'auth/cancelled-popup-request',
    message: 'Solicitud cancelada',
    severity: 'low',
    category: 'auth',
    userMessage: 'El proceso de autenticación fue cancelado.',
    technicalMessage: 'This operation has been cancelled due to another conflicting popup',
    suggestions: ['Intenta de nuevo', 'Cierra otros popups abiertos'],
  },

  // Errores de Firestore
  'firestore/permission-denied': {
    code: 'firestore/permission-denied',
    message: 'Permiso denegado',
    severity: 'high',
    category: 'firestore',
    userMessage: 'No tienes permisos para realizar esta acción.',
    technicalMessage: 'The caller does not have permission to execute the specified operation',
    suggestions: ['Contacta al administrador', 'Verifica tu sesión'],
  },
  'firestore/unavailable': {
    code: 'firestore/unavailable',
    message: 'Servicio no disponible',
    severity: 'high',
    category: 'firestore',
    userMessage: 'El servicio está temporalmente no disponible. Intenta de nuevo.',
    technicalMessage: 'The service is currently unavailable',
    suggestions: ['Intenta de nuevo en unos minutos', 'Verifica tu conexión'],
  },
  'firestore/deadline-exceeded': {
    code: 'firestore/deadline-exceeded',
    message: 'Tiempo agotado',
    severity: 'medium',
    category: 'firestore',
    userMessage: 'La operación tardó demasiado. Intenta de nuevo.',
    technicalMessage: 'Deadline exceeded before operation could complete',
    suggestions: ['Intenta de nuevo', 'Verifica tu conexión'],
  },

  // Errores de Storage
  'storage/unauthorized': {
    code: 'storage/unauthorized',
    message: 'No autorizado',
    severity: 'high',
    category: 'storage',
    userMessage: 'No tienes permisos para subir archivos.',
    technicalMessage: 'User does not have permission to access the object',
    suggestions: ['Verifica tu sesión', 'Contacta al administrador'],
  },
  'storage/canceled': {
    code: 'storage/canceled',
    message: 'Operación cancelada',
    severity: 'low',
    category: 'storage',
    userMessage: 'La subida del archivo fue cancelada.',
    technicalMessage: 'User canceled the upload',
    suggestions: ['Intenta subir el archivo de nuevo'],
  },
  'storage/invalid-format': {
    code: 'storage/invalid-format',
    message: 'Formato inválido',
    severity: 'medium',
    category: 'storage',
    userMessage: 'El formato del archivo no es válido.',
    technicalMessage: 'Invalid format',
    suggestions: ['Usa un formato válido (PDF, DOC, DOCX)', 'Verifica el archivo'],
  },

  // Errores de validación personalizados
  'validation/required': {
    code: 'validation/required',
    message: 'Campo requerido',
    severity: 'low',
    category: 'validation',
    userMessage: 'Este campo es obligatorio.',
    technicalMessage: 'Required field is missing',
    suggestions: ['Completa todos los campos obligatorios'],
  },
  'validation/invalid-format': {
    code: 'validation/invalid-format',
    message: 'Formato inválido',
    severity: 'low',
    category: 'validation',
    userMessage: 'El formato ingresado no es válido.',
    technicalMessage: 'Invalid format provided',
    suggestions: ['Verifica el formato del campo'],
  },
  'validation/password-mismatch': {
    code: 'validation/password-mismatch',
    message: 'Contraseñas no coinciden',
    severity: 'low',
    category: 'validation',
    userMessage: 'Las contraseñas no coinciden.',
    technicalMessage: 'Password confirmation does not match',
    suggestions: ['Verifica que ambas contraseñas sean iguales'],
  },

  // Errores del sistema
  'system/unknown': {
    code: 'system/unknown',
    message: 'Error desconocido',
    severity: 'high',
    category: 'system',
    userMessage: 'Ha ocurrido un error inesperado. Intenta de nuevo.',
    technicalMessage: 'An unknown error occurred',
    suggestions: ['Intenta de nuevo', 'Contacta al soporte si persiste'],
  },
  'system/maintenance': {
    code: 'system/maintenance',
    message: 'Mantenimiento',
    severity: 'high',
    category: 'system',
    userMessage: 'El sistema está en mantenimiento. Intenta más tarde.',
    technicalMessage: 'System is under maintenance',
    suggestions: ['Intenta en unos minutos', 'Revisa las notificaciones del sistema'],
  },
};

export class ErrorHandler {
  static parseError(error: any): ErrorInfo {
    // Si es un FirebaseError
    if (error instanceof FirebaseError) {
      return (
        ERROR_CODES[error.code] || {
          code: error.code,
          message: 'Error de Firebase',
          severity: 'high',
          category: 'system',
          userMessage: 'Ha ocurrido un error. Intenta de nuevo.',
          technicalMessage: error.message,
          suggestions: ['Intenta de nuevo', 'Contacta al soporte si persiste'],
        }
      );
    }

    // Si es un Error estándar
    if (error instanceof Error) {
      // Buscar si el mensaje contiene algún código conocido
      const knownError = Object.values(ERROR_CODES).find(
        (err) => error.message.includes(err.code) || error.message.includes(err.message)
      );

      if (knownError) {
        return knownError;
      }

      return {
        code: 'system/unknown',
        message: 'Error desconocido',
        severity: 'high',
        category: 'system',
        userMessage: 'Ha ocurrido un error inesperado. Intenta de nuevo.',
        technicalMessage: error.message,
        suggestions: ['Intenta de nuevo', 'Contacta al soporte si persiste'],
      };
    }

    // Si es un string
    if (typeof error === 'string') {
      return {
        code: 'system/unknown',
        message: 'Error desconocido',
        severity: 'medium',
        category: 'system',
        userMessage: error,
        technicalMessage: error,
        suggestions: ['Intenta de nuevo'],
      };
    }

    // Error por defecto
    return ERROR_CODES['system/unknown'];
  }

  static getUserMessage(error: any): string {
    return this.parseError(error).userMessage;
  }

  static getTechnicalMessage(error: any): string {
    return this.parseError(error).technicalMessage;
  }

  static getSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    return this.parseError(error).severity;
  }

  static getSuggestions(error: any): string[] {
    return this.parseError(error).suggestions || [];
  }

  static shouldRetry(error: any): boolean {
    const errorInfo = this.parseError(error);
    return errorInfo.category === 'network' || errorInfo.code === 'firestore/deadline-exceeded';
  }

  static getRetryDelay(error: any): number {
    const errorInfo = this.parseError(error);

    switch (errorInfo.severity) {
      case 'low':
        return 1000; // 1 segundo
      case 'medium':
        return 3000; // 3 segundos
      case 'high':
        return 5000; // 5 segundos
      case 'critical':
        return 10000; // 10 segundos
      default:
        return 3000;
    }
  }
}

// Funciones de conveniencia para compatibilidad con código existente
export const getAuthErrorMessage = (error: any): string => {
  return ErrorHandler.getUserMessage(error);
};

export const getRegistrationErrorMessage = (error: any): string => {
  return ErrorHandler.getUserMessage(error);
};

export const getGoogleSignInErrorMessage = (error: any): string => {
  return ErrorHandler.getUserMessage(error);
};

export const getFirestoreErrorMessage = (error: any): string => {
  return ErrorHandler.getUserMessage(error);
};

export const getStorageErrorMessage = (error: any): string => {
  return ErrorHandler.getUserMessage(error);
};


