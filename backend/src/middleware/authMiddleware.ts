import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';

export type RoleType = 'STUDENT' | 'ADMIN' | 'HOD';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: RoleType;
  studentId?: string;
  adminId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return ApiResponse.error(res, 'Authentication token required', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Invalid or expired authentication token', 401);
  }
}

export function requireRole(allowedRoles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Access forbidden: Insufficient permissions', 403);
    }

    next();
  };
}
