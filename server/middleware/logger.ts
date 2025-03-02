import type { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware
 */
const logger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

export default logger;