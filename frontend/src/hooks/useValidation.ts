import { useCallback, useState } from 'react';
import { ValidationResult, ValidationSchema, validationService } from '../services/validationService';

export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = useCallback(
    (data: any): ValidationResult => {
      const result = validationService.validate(data, schema);
      setErrors(result.errors);
      return result;
    },
    [schema]
  );

  const validateField = useCallback(
    (fieldName: string, value: any): boolean => {
      const fieldSchema = { [fieldName]: schema[fieldName] };
      const result = validationService.validate({ [fieldName]: value }, fieldSchema);

      setErrors((prev) => ({
        ...prev,
        [fieldName]: result.errors[fieldName] || '',
      }));

      return !result.errors[fieldName];
    },
    [schema]
  );

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  const setFieldValue = useCallback(
    (fieldName: string, value: any) => {
      setFieldTouched(fieldName);
      validateField(fieldName, value);
    },
    [setFieldTouched, validateField]
  );

  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      return validationService.getFieldError(errors, fieldName);
    },
    [errors]
  );

  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return validationService.hasFieldError(errors, fieldName);
    },
    [errors]
  );

  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return !!touched[fieldName];
    },
    [touched]
  );

  const shouldShowError = useCallback(
    (fieldName: string): boolean => {
      return isFieldTouched(fieldName) && hasFieldError(fieldName);
    },
    [isFieldTouched, hasFieldError]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    touched,
    isValid,
    validate,
    validateField,
    setFieldTouched,
    setFieldValue,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    shouldShowError,
    clearErrors,
    clearFieldError,
  };
};
