import { useCallback, useRef, useState } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  context?: string;
  details?: any;
  retryable?: boolean;
  retryAction?: () => void;
}

export interface ErrorHandlerOptions {
  maxErrors?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  logToConsole?: boolean;
  showToUser?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    maxErrors = 10,
    autoDismiss = true,
    autoDismissDelay = 5000,
    logToConsole = true,
    showToUser = true,
  } = options;

  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const errorIdCounter = useRef(0);

  // Generar ID único para errores
  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${++errorIdCounter.current}`;
  }, []);

  // Agregar error con protección contra bucles
  const addError = useCallback(
    (
      message: string,
      type: ErrorInfo['type'] = 'error',
      context?: string,
      details?: any,
      retryable = false,
      retryAction?: () => void
    ) => {
      // Protección contra bucles infinitos
      if (
        message.includes('Cannot read properties of undefined') &&
        message.includes('reading') &&
        message.includes('add')
      ) {
        console.warn('Error de bucle infinito detectado, ignorando:', message);
        return 'ignored';
      }

      const errorId = generateErrorId();
      const newError: ErrorInfo = {
        id: errorId,
        message,
        type,
        timestamp: new Date(),
        context,
        details,
        retryable,
        retryAction,
      };

      setErrors((prev) => {
        const updated = [newError, ...prev];
        // Mantener solo el número máximo de errores
        return updated.slice(0, maxErrors);
      });

      // Log a consola si está habilitado
      if (logToConsole) {
        console.error(`[${context || 'Error'}] ${message}`, details);
      }

      // Auto-dismiss si está habilitado
      if (autoDismiss && showToUser) {
        setTimeout(() => {
          removeError(errorId);
        }, autoDismissDelay);
      }

      return errorId;
    },
    [maxErrors, autoDismiss, autoDismissDelay, logToConsole, showToUser, generateErrorId]
  );

  // Remover error
  const removeError = useCallback((errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  }, []);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Limpiar errores por tipo
  const clearErrorsByType = useCallback((type: ErrorInfo['type']) => {
    setErrors((prev) => prev.filter((error) => error.type !== type));
  }, []);

  // Reintentar acción
  const retryAction = useCallback(
    (errorId: string) => {
      const error = errors.find((e) => e.id === errorId);
      if (error && error.retryAction) {
        try {
          error.retryAction();
          removeError(errorId);
        } catch (retryError) {
          console.error('Error al reintentar la acción:', retryError);
        }
      }
    },
    [errors, removeError, addError]
  );

  // Wrapper para manejar errores de funciones async
  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string,
      retryable = false,
      retryAction?: () => Promise<T>
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const errorDetails = error instanceof Error ? error.stack : error;

        addError(
          errorMessage,
          'error',
          context,
          errorDetails,
          retryable,
          retryAction ? () => handleAsyncError(retryAction, context, false) : undefined
        );

        return null;
      }
    },
    [addError]
  );

  // Wrapper para manejar errores de funciones síncronas
  const handleSyncError = useCallback(
    <T>(syncFn: () => T, context?: string, retryable = false, retryAction?: () => T): T | null => {
      try {
        return syncFn();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const errorDetails = error instanceof Error ? error.stack : error;

        addError(
          errorMessage,
          'error',
          context,
          errorDetails,
          retryable,
          retryAction ? () => handleSyncError(retryAction, context, false) : undefined
        );

        return null;
      }
    },
    [addError]
  );

  // Obtener errores por tipo
  const getErrorsByType = useCallback(
    (type: ErrorInfo['type']) => {
      return errors.filter((error) => error.type === type);
    },
    [errors]
  );

  // Obtener errores por contexto
  const getErrorsByContext = useCallback(
    (context: string) => {
      return errors.filter((error) => error.context === context);
    },
    [errors]
  );

  // Verificar si hay errores
  const hasErrors = errors.length > 0;
  const hasErrorsByType = useCallback(
    (type: ErrorInfo['type']) => {
      return errors.some((error) => error.type === type);
    },
    [errors]
  );

  // Obtener el error más reciente
  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[0] : null;
  }, [errors]);

  // Obtener estadísticas de errores
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errors.length,
      byType: {
        error: errors.filter((e) => e.type === 'error').length,
        warning: errors.filter((e) => e.type === 'warning').length,
        info: errors.filter((e) => e.type === 'info').length,
      },
      retryable: errors.filter((e) => e.retryable).length,
      byContext: errors.reduce((acc, error) => {
        const context = error.context || 'unknown';
        acc[context] = (acc[context] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }, [errors]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    clearErrorsByType,
    retryAction,
    handleAsyncError,
    handleSyncError,
    getErrorsByType,
    getErrorsByContext,
    hasErrors,
    hasErrorsByType,
    getLatestError,
    getErrorStats,
  };
};

// Hook específico para errores de formulario
export const useFormErrorHandler = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const setFormError = useCallback((error: string) => {
    setFormErrors((prev) => [...prev, error]);
  }, []);

  const clearFormErrors = useCallback(() => {
    setFormErrors([]);
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setFormErrors([]);
  }, []);

  const hasFieldError = useCallback(
    (field: string) => {
      return fieldErrors[field] !== undefined;
    },
    [fieldErrors]
  );

  const getFieldError = useCallback(
    (field: string) => {
      return fieldErrors[field];
    },
    [fieldErrors]
  );

  const hasFormErrors = formErrors.length > 0;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasAnyErrors = hasFormErrors || hasFieldErrors;

  return {
    fieldErrors,
    formErrors,
    setFieldError,
    clearFieldError,
    setFormError,
    clearFormErrors,
    clearAllErrors,
    hasFieldError,
    getFieldError,
    hasFormErrors,
    hasFieldErrors,
    hasAnyErrors,
  };
};
