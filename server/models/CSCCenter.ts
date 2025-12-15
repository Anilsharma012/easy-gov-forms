import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationRequest {
  type: 'document' | 'video';
  requestedAt: Date;
  message?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  fileUrl?: string;
}

export interface ICSCCenter extends Document {
  userId: mongoose.Types.ObjectId;
  centerName: string;
  ownerName: string;
  email: string;
  mobile: string;
  password: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  cscId?: string;
  status: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  verificationRequests: IVerificationRequest[];
  assignedPackages: mongoose.Types.ObjectId[];
  totalLeads: number;
  usedLeads: number;
  totalEarnings: number;
  documents: {
    type: string;
    fileName: string;
    filePath: string;
    status: 'pending' | 'verified' | 'rejected';
  }[];
  registeredAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationRequestSchema = new Schema({
  type: { type: String, enum: ['document', 'video'], required: true },
  requestedAt: { type: Date, default: Date.now },
  message: { type: String },
  status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date },
  fileUrl: { type: String },
});

const cscCenterSchema = new Schema<ICSCCenter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  centerName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  cscId: { type: String },
  status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  verificationRequests: [verificationRequestSchema],
  assignedPackages: [{ type: Schema.Types.ObjectId, ref: 'CSCLeadPackage' }],
  totalLeads: { type: Number, default: 0 },
  usedLeads: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  documents: [{
    type: { type: String },
    fileName: { type: String },
    filePath: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  }],
  registeredAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
}, { timestamps: true });

cscCenterSchema.index({ status: 1 });
cscCenterSchema.index({ state: 1, district: 1 });

export const CSCCenter = mongoose.model<ICSCCenter>('CSCCenter', cscCenterSchema);
