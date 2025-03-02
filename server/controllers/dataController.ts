import type { Request, Response } from 'express';
import { Content } from '../models/Content';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all content
 */
export const getAllContent = async (_req: Request, res: Response): Promise<void> => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.status(200).json(content);
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get content by ID
 */
export const getContentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }
    
    res.status(200).json(content);
  } catch (error) {
    console.error('Get content by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create new content
 */
export const createContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { title, description, contentType, data } = req.body;
    
    const newContent = new Content({
      title,
      description,
      contentType,
      data,
      createdBy: req.user.id
    });
    
    await newContent.save();
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update existing content
 */
export const updateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { title, description, contentType, data } = req.body;
    
    // Find content
    let content = await Content.findById(req.params.id);
    
    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }
    
    // Check ownership
    if (content.createdBy.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this content' });
      return;
    }
    
    // Update content
    content = await Content.findByIdAndUpdate(
      req.params.id,
      { title, description, contentType, data, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json(content);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete content
 */
export const deleteContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    // Find content
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }
    
    // Check ownership
    if (content.createdBy.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to delete this content' });
      return;
    }
    
    // Delete content
    await Content.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};