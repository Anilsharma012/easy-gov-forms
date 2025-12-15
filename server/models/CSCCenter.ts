import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCCenter extends Document {
  centerName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  status: 'verified' | 'pending' | 'rejected';
  leadsAssigned: number;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cscCenterSchema = new Schema<ICSCCenter>({
  centerName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
  leadsAssigned: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const CSCCenter = mongoose.model<ICSCCenter>('CSCCenter', cscCenterSchema);
