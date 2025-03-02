import express from 'express';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/data', dataRoutes);

export default router;