import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCPackageAssignment extends Document {
  cscCenterId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  packageName: string;
  totalLeads: number;
  usedLeads: number;
  remainingLeads: number;
  price: number;
  expiresAt: Date;
  status: 'active' | 'expired' | 'exhausted';
  assignedAt: Date;
  assignedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cscPackageAssignmentSchema = new Schema<ICSCPackageAssignment>({
  cscCenterId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'CSCLeadPackage', required: true },
  packageName: { type: String, required: true },
  totalLeads: { type: Number, required: true },
  usedLeads: { type: Number, default: 0 },
  remainingLeads: { type: Number, required: true },
  price: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'exhausted'], default: 'active' },
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

cscPackageAssignmentSchema.index({ cscCenterId: 1, status: 1 });

export const CSCPackageAssignment = mongoose.model<ICSCPackageAssignment>('CSCPackageAssignment', cscPackageAssignmentSchema);
