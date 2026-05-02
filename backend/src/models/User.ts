import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'MEMBER';
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
