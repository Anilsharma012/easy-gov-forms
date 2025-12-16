import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadComment {
  text: string;
  addedBy: mongoose.Types.ObjectId;
  addedByType: 'admin' | 'csc';
  createdAt: Date;
}

export interface ILead extends Document {
  name: string;
  mobile: string;
  email?: string;
  formName: string;
  type: 'job' | 'scheme' | 'document';
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedCenterId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  // Optional linkage (helps us sync application -> lead reliably)
  applicationId?: string;
  jobId?: mongoose.Types.ObjectId;
  notes?: string;
  comments?: ILeadComment[];
  createdAt: Date;
  updatedAt: Date;
}

const leadCommentSchema = new Schema({
  text: { type: String, required: true },
  addedBy: { type: Schema.Types.ObjectId, required: true },
  addedByType: { type: String, enum: ['admin', 'csc'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  formName: { type: String, required: true },
  type: { type: String, enum: ['job', 'scheme', 'document'], required: true },
  status: { type: String, enum: ['new', 'in-progress', 'completed', 'cancelled'], default: 'new' },
  assignedTo: { type: String },
  assignedCenterId: { type: Schema.Types.ObjectId, ref: 'CSCCenter' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  applicationId: { type: String, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  notes: { type: String },
  comments: [leadCommentSchema],
}, { timestamps: true });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
