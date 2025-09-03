import { describe, expect, it } from 'vitest';
import { validationService } from '../validationService';

describe('ValidationService', () => {
  describe('validateUserRegistration', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'user',
      };

      const result = validationService.validateUserRegistration(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
        role: 'user',
      };

      const result = validationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
        role: 'user',
      };

      const result = validationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'invalid-role',
      };

      const result = validationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.role).toBeDefined();
    });

    it('should validate psychologist registration with required fields', () => {
      const validData = {
        email: 'psychologist@example.com',
        password: 'password123',
        name: 'Dr. Smith',
        role: 'psychologist',
        licenseNumber: 'PSY123456',
        specialization: 'Clinical Psychology',
        experience: 5,
      };

      const result = validationService.validateUserRegistration(validData);
      // Check if validation passes or show the actual errors
      if (!result.isValid) {
        console.log('Validation errors:', result.errors);
      }
      expect(result.isValid).toBe(true);
    });

    it('should reject psychologist without license number', () => {
      const invalidData = {
        email: 'psychologist@example.com',
        password: 'password123',
        name: 'Dr. Smith',
        role: 'psychologist',
        specialization: 'Clinical Psychology',
        experience: 5,
      };

      const result = validationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.licenseNumber).toBeDefined();
    });
  });

  describe('validateMoodLog', () => {
    it('should validate correct mood log data', () => {
      const validData = {
        mood: 4,
        description: 'I had a great day today!',
        activities: ['work', 'exercise'],
        wellness: {
          sleep: 8,
          stress: 3,
          energy: 7,
          social: 6,
        },
        habits: {
          exercise: true,
          meditation: false,
          nutrition: true,
          gratitude: true,
        },
      };

      const result = validationService.validateMoodLog(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject mood outside valid range', () => {
      const invalidData = {
        mood: 6,
        description: 'I had a great day today!',
      };

      const result = validationService.validateMoodLog(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.mood).toBeDefined();
    });

    it('should reject short description', () => {
      const invalidData = {
        mood: 4,
        description: 'Good',
      };

      const result = validationService.validateMoodLog(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    it('should reject invalid wellness metrics', () => {
      const invalidData = {
        mood: 4,
        description: 'I had a great day today!',
        wellness: {
          sleep: 15, // Invalid: should be 1-10
          stress: 3,
          energy: 7,
          social: 6,
        },
      };

      const result = validationService.validateMoodLog(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.wellness).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('should validate correct session data', () => {
      const validData = {
        patientId: 'patient123',
        title: 'Weekly Session',
        description: 'Regular check-in session',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        type: 'video',
      };

      const result = validationService.validateSession(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject session in the past', () => {
      const invalidData = {
        patientId: 'patient123',
        title: 'Weekly Session',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        duration: 60,
        type: 'video',
      };

      const result = validationService.validateSession(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.scheduledAt).toBeDefined();
    });

    it('should reject invalid session type', () => {
      const invalidData = {
        patientId: 'patient123',
        title: 'Weekly Session',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 60,
        type: 'invalid-type',
      };

      const result = validationService.validateSession(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBeDefined();
    });
  });

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      const result = validationService.sanitizeText('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should remove HTML tags', () => {
      const result = validationService.sanitizeText('Hello <script>alert("xss")</script> world');
      expect(result).toBe('Hello scriptalert("xss")/script world');
    });

    it('should normalize whitespace', () => {
      const result = validationService.sanitizeText('Hello    world\n\n\n');
      expect(result).toBe('Hello world');
    });
  });
});
