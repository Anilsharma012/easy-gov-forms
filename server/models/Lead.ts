import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  name: string;
  mobile: string;
  email?: string;
  formName: string;
  type: 'job' | 'scheme' | 'document';
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedCenterId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  formName: { type: String, required: true },
  type: { type: String, enum: ['job', 'scheme', 'document'], required: true },
  status: { type: String, enum: ['new', 'in-progress', 'completed', 'cancelled'], default: 'new' },
  assignedTo: { type: String },
  assignedCenterId: { type: Schema.Types.ObjectId, ref: 'CSCCenter' },
  notes: { type: String },
}, { timestamps: true });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
