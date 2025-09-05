import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, ConsentType } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// JWT Secret
const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-secret';

// Authenticate JWT token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid or inactive user' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Require specific role
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Require ownership or admin role
export const requireOwnershipOrRole = (roles: string[] = ['ADMIN']) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceUserId = req.params.userId || req.params.id;
    const isOwner = req.user.id === resourceUserId;
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  };
};

// Require consent for specific action
export const requireConsent = (consentType: ConsentType) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const consent = await prisma.consent.findFirst({
        where: {
          userId: req.user.id,
          type: consentType,
          granted: true,
          revokedAt: null,
        },
      });

      if (!consent) {
        res.status(403).json({ 
          error: 'Consent required',
          consentType: consentType,
          message: 'User consent is required for this action'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Consent check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
