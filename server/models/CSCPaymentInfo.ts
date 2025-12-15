import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCPaymentInfo extends Document {
  centerId: mongoose.Types.ObjectId;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  upiId?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cscPaymentInfoSchema = new Schema<ICSCPaymentInfo>({
  centerId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true, unique: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  accountType: { type: String, enum: ['savings', 'current'], default: 'savings' },
  upiId: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
}, { timestamps: true });

cscPaymentInfoSchema.index({ centerId: 1 });
cscPaymentInfoSchema.index({ status: 1 });

export const CSCPaymentInfo = mongoose.model<ICSCPaymentInfo>('CSCPaymentInfo', cscPaymentInfoSchema);
