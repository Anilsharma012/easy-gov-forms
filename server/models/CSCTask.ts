import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCTask extends Document {
  centerId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  amount: number;
  completedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const cscTaskSchema = new Schema<ICSCTask>({
  centerId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'verified', 'rejected'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date },
  amount: { type: Number, default: 0 },
  completedAt: { type: Date },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  attachments: [{ type: String }],
}, { timestamps: true });

cscTaskSchema.index({ centerId: 1 });
cscTaskSchema.index({ status: 1 });
cscTaskSchema.index({ centerId: 1, status: 1 });

export const CSCTask = mongoose.model<ICSCTask>('CSCTask', cscTaskSchema);
