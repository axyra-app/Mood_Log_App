import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient, ConsentType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// JWT Secrets
const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret';
const BCRYPT_ROUNDS = parseInt(process.env['BCRYPT_ROUNDS'] || '12');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  phone: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
});

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, dateOfBirth, gender, phone, emergencyContact } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user with profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'USER',
        },
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          phone,
          emergencyContact: emergencyContact ? emergencyContact : undefined,
        },
      });

      // Create user preferences
      await tx.userPreferences.create({
        data: {
          userId: user.id,
        },
      });

      // Create default consents
      await tx.consent.createMany({
        data: [
          {
            userId: user.id,
            type: 'DATA_PROCESSING',
            granted: true,
            grantedAt: new Date(),
          },
          {
            userId: user.id,
            type: 'AI_ANALYSIS',
            granted: false,
          },
          {
            userId: user.id,
            type: 'PSYCHOLOGIST_ACCESS',
            granted: false,
          },
          {
            userId: user.id,
            type: 'RESEARCH',
            granted: false,
          },
          {
            userId: user.id,
            type: 'MARKETING',
            granted: false,
          },
        ],
      });

      return user;
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(result.id);

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: result.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log registration
    await prisma.auditLog.create({
      data: {
        userId: result.id,
        action: 'USER_REGISTERED',
        resource: 'USER',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'USER',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: session.userId, type: 'access' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout user
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      await prisma.session.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user!.id,
        },
      });
    }

    // Log logout
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'USER_LOGOUT',
        resource: 'USER',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        preferences: true,
        consents: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const { firstName, lastName, phone, bio, emergencyContact } = validatedData;

    // Update user profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(emergencyContact && { emergencyContact: emergencyContact }),
      },
    });

    // Log profile update
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PROFILE_UPDATED',
        resource: 'USER_PROFILE',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};
