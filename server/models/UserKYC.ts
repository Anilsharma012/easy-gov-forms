import mongoose, { Document, Schema } from 'mongoose';

export interface IKYCDocument {
  documentType: 'aadhaar' | 'pan' | 'photo' | 'signature' | 'address_proof';
  fileName: string;
  filePath: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
}

export interface IUserKYC extends Document {
  userId: mongoose.Types.ObjectId;
  documents: IKYCDocument[];
  overallStatus: 'not_started' | 'in_progress' | 'pending_review' | 'verified' | 'rejected';
  submittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const kycDocumentSchema = new Schema({
  documentType: { 
    type: String, 
    enum: ['aadhaar', 'pan', 'photo', 'signature', 'address_proof'], 
    required: true 
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

const userKYCSchema = new Schema<IUserKYC>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  documents: [kycDocumentSchema],
  overallStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'pending_review', 'verified', 'rejected'], 
    default: 'not_started' 
  },
  submittedAt: { type: Date },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  adminNotes: { type: String },
}, { timestamps: true });

userKYCSchema.index({ userId: 1 });
userKYCSchema.index({ overallStatus: 1 });

export const UserKYC = mongoose.model<IUserKYC>('UserKYC', userKYCSchema);
