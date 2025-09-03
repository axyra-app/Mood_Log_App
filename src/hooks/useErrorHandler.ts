import { useCallback, useState } from 'react';
import { AppError, errorService } from '../services/errorService';

export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: any, context?: any) => {
    console.error('Error handled by useErrorHandler:', error);

    const appError = errorService.handleFirebaseError(error, context);
    setError(appError);

    return appError;
  }, []);

  const handleAsync = useCallback(
    async <T>(asyncFunction: () => Promise<T>, context?: any): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await errorService.retryOperation(asyncFunction, 3, context);
        return result;
      } catch (error) {
        const appError = handleError(error, context);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(
    async <T>(asyncFunction: () => Promise<T>, context?: any): Promise<T | null> => {
      return handleAsync(asyncFunction, context);
    },
    [handleAsync]
  );

  return {
    error,
    loading,
    handleError,
    handleAsync,
    clearError,
    retry,
    hasError: error !== null,
  };
};
