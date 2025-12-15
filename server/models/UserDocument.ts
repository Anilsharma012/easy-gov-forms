import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  documentNumber?: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userDocumentSchema = new Schema<IUserDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  documentNumber: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
}, { timestamps: true });

export const UserDocument = mongoose.model<IUserDocument>('UserDocument', userDocumentSchema);
