import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../features/auth/model.js';
import { ApiError } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Protect routes — requires valid JWT access token in Authorization header
 */
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized — no token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtAccessSecret) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

/**
 * Admin-only access
 */
export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    next(new ApiError(403, 'Admin access required'));
    return;
  }
  next();
};
