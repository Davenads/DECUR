import express from 'express';
import type { Request, Response } from 'express';
import { 
  getAllContent, 
  getContentById, 
  createContent, 
  updateContent, 
  deleteContent 
} from '../../controllers/dataController';
import authMiddleware from '../../middleware/auth';

const router = express.Router();

// Data routes
router.get('/', getAllContent);
router.get('/:id', getContentById);
router.post('/', authMiddleware, createContent);
router.put('/:id', authMiddleware, updateContent);
router.delete('/:id', authMiddleware, deleteContent);

// Fallback route
router.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Data endpoint not found' });
});

export default router;