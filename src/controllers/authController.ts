import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';

// Default authorized credentials
const DEFAULT_EMAIL = (process.env.ADMIN_EMAIL || 'fuadtalukder25@gmail.com').toLowerCase().trim();
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || '56867585';
const JWT_SECRET = process.env.JWT_SECRET || 'careertrack-secret-key-2026-secure-auth';

// Helper to generate a signed token
function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Helper to verify token
export function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * @desc Login user
 * @route POST /api/auth/login or /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password);

    // 1. Check MongoDB database User collection first
    const dbUser = await User.findOne({ email: normalizedEmail });
    if (dbUser && dbUser.comparePassword(cleanPassword)) {
      const user = {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      });
      return;
    }

    // 2. Check default/env credentials fallback
    const validFallbackEmails = [
      DEFAULT_EMAIL,
      'fuadtalukder25@gmail.com',
      'webfuadtk@gmail.com',
    ];

    if (validFallbackEmails.includes(normalizedEmail) && cleanPassword === DEFAULT_PASSWORD) {
      const user = {
        id: 'usr_fuad_01',
        name: 'Fuad Talukder',
        email: normalizedEmail,
        role: 'admin',
      };

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get current authenticated user
 * @route GET /api/auth/me or /auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
      return;
    }

    // Attempt to fetch latest profile from DB if exists
    const dbUser = await User.findOne({ email: decoded.email }).select('-password');

    res.status(200).json({
      success: true,
      data: {
        user: dbUser
          ? {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
            }
          : {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
            },
      },
    });
  } catch (error) {
    next(error);
  }
};
