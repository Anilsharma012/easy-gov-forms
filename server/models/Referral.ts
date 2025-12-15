import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredId: mongoose.Types.ObjectId;
  referralCode: string;
  rewardPoints: number;
  status: 'pending' | 'completed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>({
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  rewardPoints: { type: Number, default: 50 },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completedAt: { type: Date },
}, { timestamps: true });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
