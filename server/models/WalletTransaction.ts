import mongoose, { Document, Schema } from 'mongoose';

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  type: 'credit' | 'debit' | 'withdrawal' | 'bonus';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  reference?: string;
  taskId?: mongoose.Types.ObjectId;
  adminNote?: string;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  walletId: { type: Schema.Types.ObjectId, ref: 'CSCWallet', required: true },
  centerId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true },
  type: { type: String, enum: ['credit', 'debit', 'withdrawal', 'bonus'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected', 'cancelled'], default: 'completed' },
  reference: { type: String },
  taskId: { type: Schema.Types.ObjectId, ref: 'CSCTask' },
  adminNote: { type: String },
  processedAt: { type: Date },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

walletTransactionSchema.index({ walletId: 1 });
walletTransactionSchema.index({ centerId: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);
