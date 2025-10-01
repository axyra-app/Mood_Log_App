import { useCallback, useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const commonValidationRules: ValidationRules = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: 'El nombre debe tener entre 2 y 50 caracteres y solo contener letras',
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: 'El apellido debe tener entre 2 y 50 caracteres y solo contener letras',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Por favor ingresa un email válido',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Por favor ingresa un número de teléfono válido',
  },
  // Validaciones específicas para psicólogos
  professionalTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'El título profesional debe tener entre 3 y 100 caracteres',
  },
  specialization: {
    required: true,
    message: 'Por favor selecciona una especialización',
  },
  yearsOfExperience: {
    required: true,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 50) {
        return 'Los años de experiencia deben ser un número entre 0 y 50';
      }
      return null;
    },
  },
  licenseNumber: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9\-]+$/,
    message: 'El número de licencia debe tener entre 3 y 20 caracteres alfanuméricos',
  },
  bio: {
    required: true,
    minLength: 50,
    maxLength: 1000,
    message: 'La descripción profesional debe tener entre 50 y 1000 caracteres',
  },
};

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback((data: any, rules: ValidationRules): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = data[field];

      // Validación requerida
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field] = rule.message || `${field} es requerido`;
        return;
      }

      // Si no es requerido y está vacío, no validar más
      if (!rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return;
      }

      // Validación de longitud mínima
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        newErrors[field] = rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
        return;
      }

      // Validación de longitud máxima
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        newErrors[field] = rule.message || `${field} debe tener máximo ${rule.maxLength} caracteres`;
        return;
      }

      // Validación de patrón
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `${field} tiene un formato inválido`;
        return;
      }

      // Validación personalizada
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const hasError = useCallback(
    (field: string): boolean => {
      return !!errors[field];
    },
    [errors]
  );

  const getError = useCallback(
    (field: string): string => {
      return errors[field] || '';
    },
    [errors]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  return {
    errors,
    validate,
    hasError,
    getError,
    clearErrors,
    clearError,
    setError,
  };
};
