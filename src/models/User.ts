import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      default: 'Fuad Talukder',
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password (supports plain text or SHA256 hashed)
UserSchema.methods.comparePassword = function (candidatePassword: string): boolean {
  if (this.password === candidatePassword) {
    return true;
  }
  const hashedCandidate = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return this.password === hashedCandidate;
};

export const User = mongoose.model<IUser>('User', UserSchema);
