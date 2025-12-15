import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  formName: string;
  type: 'job' | 'scheme' | 'document';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  formName: { type: String, required: true },
  type: { type: String, enum: ['job', 'scheme', 'document'], required: true },
  status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
