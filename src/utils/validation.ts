// Tipos de validación
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
}

// Validaciones comunes
export const commonValidations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingresa un email válido',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'La contraseña debe tener al menos 6 caracteres',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: 'El nombre debe contener solo letras y espacios',
  },
  mood: {
    required: true,
    custom: (value: number) => {
      if (value < 1 || value > 5) {
        return 'El estado de ánimo debe estar entre 1 y 5';
      }
      return null;
    },
  },
  energy: {
    custom: (value: number) => {
      if (value !== undefined && (value < 1 || value > 10)) {
        return 'El nivel de energía debe estar entre 1 y 10';
      }
      return null;
    },
  },
  stress: {
    custom: (value: number) => {
      if (value !== undefined && (value < 1 || value > 10)) {
        return 'El nivel de estrés debe estar entre 1 y 10';
      }
      return null;
    },
  },
  sleep: {
    custom: (value: number) => {
      if (value !== undefined && (value < 1 || value > 10)) {
        return 'La calidad del sueño debe estar entre 1 y 10';
      }
      return null;
    },
  },
  notes: {
    maxLength: 500,
    message: 'Las notas no pueden exceder 500 caracteres',
  },
};

// Función principal de validación
export const validateField = (field: string, value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    // Validación requerida
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || `${field} es requerido`;
    }

    // Si el campo está vacío y no es requerido, saltar otras validaciones
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Validación de longitud mínima
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
    }

    // Validación de longitud máxima
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${field} no puede exceder ${rule.maxLength} caracteres`;
    }

    // Validación de patrón
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${field} tiene un formato inválido`;
    }

    // Validación personalizada
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return rule.message || customError;
      }
    }
  }

  return null;
};

// Validar múltiples campos
export const validateFields = (validations: FieldValidation[]): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const validation of validations) {
    const error = validateField(validation.field, validation.value, validation.rules);
    if (error) {
      errors[validation.field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validaciones específicas para formularios
export const validateMoodLog = (data: any): ValidationResult => {
  return validateFields([
    {
      field: 'mood',
      value: data.mood,
      rules: [commonValidations.mood],
    },
    {
      field: 'energy',
      value: data.energy,
      rules: [commonValidations.energy],
    },
    {
      field: 'stress',
      value: data.stress,
      rules: [commonValidations.stress],
    },
    {
      field: 'sleep',
      value: data.sleep,
      rules: [commonValidations.sleep],
    },
    {
      field: 'notes',
      value: data.notes,
      rules: [commonValidations.notes],
    },
  ]);
};

export const validateUserProfile = (data: any): ValidationResult => {
  return validateFields([
    {
      field: 'displayName',
      value: data.displayName,
      rules: [commonValidations.name],
    },
    {
      field: 'email',
      value: data.email,
      rules: [commonValidations.email],
    },
  ]);
};

export const validatePasswordChange = (data: any): ValidationResult => {
  return validateFields([
    {
      field: 'currentPassword',
      value: data.currentPassword,
      rules: [commonValidations.password],
    },
    {
      field: 'newPassword',
      value: data.newPassword,
      rules: [commonValidations.password],
    },
    {
      field: 'confirmPassword',
      value: data.confirmPassword,
      rules: [
        commonValidations.password,
        {
          custom: (value: string) => {
            if (value !== data.newPassword) {
              return 'Las contraseñas no coinciden';
            }
            return null;
          },
        },
      ],
    },
  ]);
};

export const validateReminder = (data: any): ValidationResult => {
  return validateFields([
    {
      field: 'title',
      value: data.title,
      rules: [
        { required: true, minLength: 1, maxLength: 100, message: 'El título es requerido (máximo 100 caracteres)' },
      ],
    },
    {
      field: 'message',
      value: data.message,
      rules: [
        { required: true, minLength: 1, maxLength: 200, message: 'El mensaje es requerido (máximo 200 caracteres)' },
      ],
    },
    {
      field: 'time',
      value: data.time,
      rules: [
        {
          required: true,
          pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          message: 'Formato de hora inválido (HH:MM)',
        },
      ],
    },
  ]);
};

// Sanitización de datos
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios
};

export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

// Validación de archivos
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // en bytes
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
  }
): string | null => {
  // Validar tamaño
  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = options.maxSize / (1024 * 1024);
    return `El archivo no puede exceder ${maxSizeMB}MB`;
  }

  // Validar tipo
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Tipos permitidos: ${options.allowedTypes.join(', ')}`;
  }

  return null;
};

// Validación de URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validación de fecha
export const validateDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Validación de rango de fechas
export const validateDateRange = (startDate: string | Date, endDate: string | Date): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return validateDate(start) && validateDate(end) && start <= end;
};
