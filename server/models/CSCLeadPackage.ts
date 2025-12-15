import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCLeadPackage extends Document {
  name: string;
  leads: number;
  price: number;
  originalPrice: number;
  validity: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cscLeadPackageSchema = new Schema<ICSCLeadPackage>({
  name: { type: String, required: true },
  leads: { type: Number, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  validity: { type: Number, required: true, default: 30 },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const CSCLeadPackage = mongoose.model<ICSCLeadPackage>('CSCLeadPackage', cscLeadPackageSchema);
