import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCWallet extends Document {
  centerId: mongoose.Types.ObjectId;
  balance: number;
  pendingWithdrawal: number;
  totalEarnings: number;
  totalWithdrawn: number;
  createdAt: Date;
  updatedAt: Date;
}

const cscWalletSchema = new Schema<ICSCWallet>({
  centerId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true, unique: true },
  balance: { type: Number, default: 0 },
  pendingWithdrawal: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
}, { timestamps: true });

cscWalletSchema.index({ centerId: 1 });

export const CSCWallet = mongoose.model<ICSCWallet>('CSCWallet', cscWalletSchema);
