import mongoose, { Schema, Document } from 'mongoose';

export interface IIndianGovForm extends Document {
  title: string;
  department: string;
  fee?: number;
  processingTime?: string;
  docsRequired?: number;
  status: 'new' | 'popular' | 'closed';
  description?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const IndianGovFormSchema = new Schema<IIndianGovForm>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    fee: { type: Number },
    processingTime: { type: String },
    docsRequired: { type: Number },
    status: { type: String, enum: ['new', 'popular', 'closed'], default: 'new' },
    description: { type: String },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IIndianGovForm>('IndianGovForm', IndianGovFormSchema);
