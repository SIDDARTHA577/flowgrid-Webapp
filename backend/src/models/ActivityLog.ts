import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  performedBy: Types.ObjectId;
  projectId?: Types.ObjectId;
  taskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' }
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
