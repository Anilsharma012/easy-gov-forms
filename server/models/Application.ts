import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  formName: string;
  type: 'job' | 'scheme' | 'document';
  status: 'pending' | 'processing' | 'submitted' | 'approved' | 'rejected' | 'completed';
  applicationId?: string;
  formData?: any;
  packageUsed?: string;
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
  status: { type: String, enum: ['pending', 'processing', 'submitted', 'approved', 'rejected', 'completed'], default: 'pending' },
  applicationId: { type: String },
  formData: { type: Schema.Types.Mixed },
  packageUsed: { type: String },
  submittedAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
