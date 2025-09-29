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

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback((data: any, rules: ValidationRules): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach((field) => {
      const value = data[field];
      const rule = rules[field];

      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || `${field} es requerido`;
        return;
      }

      // Skip other validations if value is empty and not required
      if (!value || value.toString().trim() === '') {
        return;
      }

      // Min length validation
      if (rule.minLength && value.toString().length < rule.minLength) {
        newErrors[field] = rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
        return;
      }

      // Max length validation
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        newErrors[field] = rule.message || `${field} debe tener máximo ${rule.maxLength} caracteres`;
        return;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        newErrors[field] = rule.message || `${field} tiene un formato inválido`;
        return;
      }

      // Custom validation
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

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const hasError = useCallback(
    (field: string): boolean => {
      return !!errors[field];
    },
    [errors]
  );

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  return {
    errors,
    validate,
    clearErrors,
    clearFieldError,
    hasError,
    getError,
  };
};

// Validation rules for common fields
export const commonValidationRules: ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Por favor ingresa un email válido',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'La contraseña debe tener al menos 6 caracteres',
  },
  firstName: {
    required: true,
    minLength: 2,
    message: 'El nombre debe tener al menos 2 caracteres',
  },
  lastName: {
    required: true,
    minLength: 2,
    message: 'El apellido debe tener al menos 2 caracteres',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Por favor ingresa un número de teléfono válido',
  },
  professionalTitle: {
    required: true,
    minLength: 3,
    message: 'El título profesional es requerido',
  },
  specialization: {
    required: true,
    message: 'La especialización es requerida',
  },
  yearsOfExperience: {
    required: true,
    custom: (value) => {
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
    message: 'El número de licencia es requerido',
  },
  bio: {
    required: true,
    minLength: 50,
    message: 'La descripción profesional debe tener al menos 50 caracteres',
  },
};

export default useValidation;
