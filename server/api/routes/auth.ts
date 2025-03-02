import express from 'express';
import type { Request, Response } from 'express';
import { login, register, getUserProfile } from '../../controllers/authController';
import authMiddleware from '../../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getUserProfile);

// Fallback route
router.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Auth endpoint not found' });
});

export default router;