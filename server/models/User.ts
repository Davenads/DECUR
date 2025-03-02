import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  isModified(path: string): boolean;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
// @ts-ignore
UserSchema.pre<IUser>('save', async function(next: any) {
  // @ts-ignore
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    // @ts-ignore
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(): string {
  // Use environment variables or fallback to config
  const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';
  const jwtExpiration = process.env.JWT_EXPIRATION || '24h';
  
  return jwt.sign(
    { user: { id: this._id } },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
};

export const User = mongoose.model<IUser>('User', UserSchema);