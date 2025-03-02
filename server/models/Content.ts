import mongoose from 'mongoose';

export interface IContent extends mongoose.Document {
  title: string;
  description: string;
  contentType: string;
  data: any;
  createdBy: any;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['article', 'timeline', 'entity', 'glossary', 'resource', 'other'],
    default: 'other'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Content = mongoose.model<IContent>('Content', ContentSchema);