import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  header(name: string): string | undefined;
  params: {
    [key: string]: string;
  };
  body: any;
}

interface JwtPayload {
  user: {
    id: string;
  };
}

/**
 * Authentication middleware
 */
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }
  
  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Add user from payload to request
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;