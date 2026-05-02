import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  assignedBy?: Types.ObjectId;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
