import { describe, expect, it } from 'vitest';
import { errorService } from '../errorService';

describe('ErrorService', () => {
  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for Firebase auth errors', () => {
      const authError = { code: 'auth/user-not-found' };
      const message = errorService.getUserFriendlyMessage(authError);
      expect(message).toBe('No se encontró una cuenta con este correo electrónico.');
    });

    it('should return friendly message for Firestore errors', () => {
      const firestoreError = { code: 'firestore/permission-denied' };
      const message = errorService.getUserFriendlyMessage(firestoreError);
      expect(message).toBe('No tienes permisos para realizar esta acción.');
    });

    it('should return friendly message for network errors', () => {
      const networkError = { message: 'Network Error' };
      const message = errorService.getUserFriendlyMessage(networkError);
      expect(message).toBe('Error de conexión. Verifica tu internet.');
    });

    it('should return original message for unknown errors', () => {
      const unknownError = { message: 'Unknown error occurred' };
      const message = errorService.getUserFriendlyMessage(unknownError);
      expect(message).toBe('Unknown error occurred');
    });

    it('should return fallback message for errors without message', () => {
      const errorWithoutMessage = {};
      const message = errorService.getUserFriendlyMessage(errorWithoutMessage);
      expect(message).toBe('Ocurrió un error inesperado. Inténtalo nuevamente.');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableError = { code: 'firestore/unavailable' };
      expect(errorService.isRetryableError(retryableError)).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableError = { code: 'auth/invalid-email' };
      const result = errorService.isRetryableError(nonRetryableError);
      expect(result).toBe(false);
    });

    it('should identify timeout errors as retryable', () => {
      const timeoutError = { message: 'Request timeout' };
      expect(errorService.isRetryableError(timeoutError)).toBe(true);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff delay', () => {
      const error = { code: 'firestore/unavailable' };
      const delay1 = errorService.getRetryDelay(error, 0);
      const delay2 = errorService.getRetryDelay(error, 1);
      const delay3 = errorService.getRetryDelay(error, 2);

      expect(delay1).toBeLessThan(delay2);
      expect(delay2).toBeLessThan(delay3);
    });

    it('should cap delay at maximum value', () => {
      const error = { code: 'firestore/unavailable' };
      const delay = errorService.getRetryDelay(error, 10);
      expect(delay).toBeLessThanOrEqual(31000); // 30s + 1s jitter
    });
  });

  describe('validateRequired', () => {
    it('should pass validation for all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const requiredFields = ['name', 'email'];

      expect(() => {
        errorService.validateRequired(data, requiredFields);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const data = { name: 'John' };
      const requiredFields = ['name', 'email'];

      expect(() => {
        errorService.validateRequired(data, requiredFields);
      }).toThrow();
    });
  });

  describe('validateEmail', () => {
    it('should pass validation for valid email', () => {
      expect(() => {
        errorService.validateEmail('test@example.com');
      }).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        errorService.validateEmail('invalid-email');
      }).toThrow();
    });
  });

  describe('validatePassword', () => {
    it('should pass validation for valid password', () => {
      expect(() => {
        errorService.validatePassword('password123');
      }).not.toThrow();
    });

    it('should throw error for short password', () => {
      expect(() => {
        errorService.validatePassword('123');
      }).toThrow();
    });
  });

  describe('validateMood', () => {
    it('should pass validation for valid mood values', () => {
      expect(() => {
        errorService.validateMood(1);
        errorService.validateMood(3);
        errorService.validateMood(5);
      }).not.toThrow();
    });

    it('should throw error for invalid mood values', () => {
      expect(() => {
        errorService.validateMood(0);
      }).toThrow();

      expect(() => {
        errorService.validateMood(6);
      }).toThrow();

      expect(() => {
        errorService.validateMood(2.5);
      }).toThrow();
    });
  });

  describe('validateWellness', () => {
    it('should pass validation for valid wellness metrics', () => {
      const wellness = {
        sleep: 8,
        stress: 3,
        energy: 7,
        social: 6,
      };

      expect(() => {
        errorService.validateWellness(wellness);
      }).not.toThrow();
    });

    it('should throw error for invalid wellness metrics', () => {
      const invalidWellness = {
        sleep: 15, // Invalid: should be 1-10
        stress: 3,
        energy: 7,
        social: 6,
      };

      expect(() => {
        errorService.validateWellness(invalidWellness);
      }).toThrow();
    });
  });
});
