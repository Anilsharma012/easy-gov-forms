import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationRequest {
  _id?: mongoose.Types.ObjectId;
  type: 'document' | 'video';
  requestedAt: Date;
  message?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  fileUrl?: string;
}

export interface ICSCCenterDocument {
  type: 'addressProof' | 'identityProof' | 'photo' | 'other';
  fileName: string;
  originalFileName: string;
  filePath: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
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
  registrationNumber?: string;
  status: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  verificationRequests: IVerificationRequest[];
  assignedPackages: mongoose.Types.ObjectId[];
  totalLeads: number;
  usedLeads: number;
  totalEarnings: number;
  documents: ICSCCenterDocument[];
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

const cscDocumentSchema = new Schema({
  type: { type: String, enum: ['addressProof', 'identityProof', 'photo', 'other'], required: true },
  fileName: { type: String, required: true },
  originalFileName: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
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
  registrationNumber: { type: String },
  status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  verificationRequests: [verificationRequestSchema],
  assignedPackages: [{ type: Schema.Types.ObjectId, ref: 'CSCLeadPackage' }],
  totalLeads: { type: Number, default: 0 },
  usedLeads: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  documents: [cscDocumentSchema],
  registeredAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
}, { timestamps: true });

cscCenterSchema.index({ status: 1 });
cscCenterSchema.index({ state: 1, district: 1 });

export const CSCCenter = mongoose.model<ICSCCenter>('CSCCenter', cscCenterSchema);
