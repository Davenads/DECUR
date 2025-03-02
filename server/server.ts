import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import apiRoutes from './api';
import config from '../config';
import connectDB from './database/connection';
import logger from './middleware/logger';

const app = express();
const PORT: number = process.env.PORT 
  ? parseInt(process.env.PORT, 10) 
  : 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

// API Routes
app.use('/api', apiRoutes as any);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../.next')));
  
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../.next', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;