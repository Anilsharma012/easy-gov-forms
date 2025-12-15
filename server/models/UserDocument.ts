import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  documentNumber?: string;
  fileName: string;
  originalFileName: string;
  fileSize?: string;
  filePath: string;
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
  fileName: { type: String, required: true },
  originalFileName: { type: String, required: true },
  fileSize: { type: String },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
}, { timestamps: true });

export const UserDocument = mongoose.model<IUserDocument>('UserDocument', userDocumentSchema);
