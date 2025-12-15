import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  forms: number;
  price: number;
  originalPrice: number;
  features: string[];
  validity: number;
  popular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  forms: { type: Number, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  features: [{ type: String }],
  validity: { type: Number, required: true, default: 30 },
  popular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Package = mongoose.model<IPackage>('Package', packageSchema);
