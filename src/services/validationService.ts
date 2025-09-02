// Validation Service for Mood Log App

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

class ValidationService {
  // Common validation patterns
  private patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    name: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  };

  // Validate a single field
  validateField(value: any, rules: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${fieldName} es requerido`;
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type-specific validations
    if (typeof value === 'string') {
      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        return `${fieldName} debe tener al menos ${rules.minLength} caracteres`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${fieldName} no puede tener más de ${rules.maxLength} caracteres`;
      }
    }

    if (typeof value === 'number') {
      // Numeric validations
      if (rules.min !== undefined && value < rules.min) {
        return `${fieldName} debe ser mayor o igual a ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return `${fieldName} debe ser menor o igual a ${rules.max}`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${fieldName} tiene un formato inválido`;
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        return typeof customResult === 'string' ? customResult : `${fieldName} no es válido`;
      }
    }

    return null;
  }

  // Validate an object against a schema
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string } = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      const error = this.validateField(value, rules, fieldName);

      if (error) {
        errors[fieldName] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // User registration validation
  validateUserRegistration(data: any): ValidationResult {
    const schema: ValidationSchema = {
      email: {
        required: true,
        pattern: this.patterns.email,
        maxLength: 100,
      },
      password: {
        required: true,
        minLength: 6,
        maxLength: 100,
      },
      name: {
        required: true,
        pattern: this.patterns.name,
        minLength: 2,
        maxLength: 50,
      },
      role: {
        required: true,
        custom: (value) => ['user', 'psychologist'].includes(value),
      },
      phone: {
        required: false,
        pattern: this.patterns.phone,
        maxLength: 20,
      },
      birthDate: {
        required: false,
        custom: (value) => {
          if (!value) return true;
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          return age >= 13 && age <= 120 ? true : 'Debes tener entre 13 y 120 años';
        },
      },
      gender: {
        required: false,
        custom: (value) => {
          if (!value) return true;
          return ['male', 'female', 'other', 'prefer_not_to_say'].includes(value);
        },
      },
    };

    // Additional validation for psychologists
    if (data.role === 'psychologist') {
      schema.licenseNumber = {
        required: true,
        minLength: 5,
        maxLength: 20,
        pattern: this.patterns.alphanumeric,
      };
      schema.specialization = {
        required: true,
        minLength: 2,
        maxLength: 100,
      };
      schema.experience = {
        required: true,
        min: 0,
        max: 50,
        custom: (value) => Number.isInteger(value),
      };
      schema.bio = {
        required: false,
        maxLength: 500,
      };
    }

    return this.validate(data, schema);
  }

  // Mood log validation
  validateMoodLog(data: any): ValidationResult {
    const schema: ValidationSchema = {
      mood: {
        required: true,
        min: 1,
        max: 5,
        custom: (value) => Number.isInteger(value),
      },
      description: {
        required: true,
        minLength: 10,
        maxLength: 500,
      },
      activities: {
        required: false,
        custom: (value) => Array.isArray(value),
      },
      wellness: {
        required: false,
        custom: (value) => {
          if (!value) return true;
          const metrics = ['sleep', 'stress', 'energy', 'social'];
          for (const metric of metrics) {
            if (value[metric] !== undefined) {
              if (!Number.isInteger(value[metric]) || value[metric] < 1 || value[metric] > 10) {
                return `La métrica ${metric} debe ser un número entero entre 1 y 10`;
              }
            }
          }
          return true;
        },
      },
      habits: {
        required: false,
        custom: (value) => {
          if (!value) return true;
          const validHabits = ['exercise', 'meditation', 'nutrition', 'gratitude'];
          for (const habit of Object.keys(value)) {
            if (!validHabits.includes(habit)) {
              return `Hábito inválido: ${habit}`;
            }
            if (typeof value[habit] !== 'boolean') {
              return `El hábito ${habit} debe ser verdadero o falso`;
            }
          }
          return true;
        },
      },
    };

    return this.validate(data, schema);
  }

  // Session validation
  validateSession(data: any): ValidationResult {
    const schema: ValidationSchema = {
      patientId: {
        required: true,
        minLength: 1,
      },
      title: {
        required: true,
        minLength: 3,
        maxLength: 100,
      },
      description: {
        required: false,
        maxLength: 500,
      },
      scheduledAt: {
        required: true,
        custom: (value) => {
          const date = new Date(value);
          const now = new Date();
          return date > now ? true : 'La fecha debe ser en el futuro';
        },
      },
      duration: {
        required: true,
        min: 15,
        max: 240,
        custom: (value) => Number.isInteger(value),
      },
      type: {
        required: true,
        custom: (value) => ['video', 'phone', 'in-person'].includes(value),
      },
    };

    return this.validate(data, schema);
  }

  // Message validation
  validateMessage(data: any): ValidationResult {
    const schema: ValidationSchema = {
      text: {
        required: true,
        minLength: 1,
        maxLength: 1000,
      },
      conversationId: {
        required: true,
        minLength: 1,
      },
    };

    return this.validate(data, schema);
  }

  // Sanitize text input
  sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g;

    return html.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  // Validate and sanitize user input
  validateAndSanitize(data: any, schema: ValidationSchema): { data: any; result: ValidationResult } {
    const sanitizedData = { ...data };

    // Sanitize string fields
    for (const [fieldName, rules] of Object.entries(schema)) {
      if (typeof sanitizedData[fieldName] === 'string') {
        sanitizedData[fieldName] = this.sanitizeText(sanitizedData[fieldName]);
      }
    }

    const result = this.validate(sanitizedData, schema);
    return { data: sanitizedData, result };
  }

  // Get validation error message for a field
  getFieldError(errors: { [key: string]: string }, fieldName: string): string | null {
    return errors[fieldName] || null;
  }

  // Check if a field has an error
  hasFieldError(errors: { [key: string]: string }, fieldName: string): boolean {
    return !!errors[fieldName];
  }

  // Get all error messages as an array
  getErrorMessages(errors: { [key: string]: string }): string[] {
    return Object.values(errors);
  }

  // Get the first error message
  getFirstError(errors: { [key: string]: string }): string | null {
    const messages = this.getErrorMessages(errors);
    return messages.length > 0 ? messages[0] : null;
  }
}

export const validationService = new ValidationService();
