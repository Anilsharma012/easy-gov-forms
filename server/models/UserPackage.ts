import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPackage extends Document {
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  packageName: string;
  totalForms: number;
  usedForms: number;
  remainingForms: number;
  purchasedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired';
  paymentId: string;
  orderId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userPackageSchema = new Schema<IUserPackage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  packageName: { type: String, required: true },
  totalForms: { type: Number, required: true },
  usedForms: { type: Number, default: 0 },
  remainingForms: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export const UserPackage = mongoose.model<IUserPackage>('UserPackage', userPackageSchema);
