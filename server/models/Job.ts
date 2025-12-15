import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department: string;
  category: string;
  location: string;
  eligibility: string;
  description?: string;
  startDate: Date;
  lastDate: Date;
  vacancies: number;
  salaryRange: string;
  fees: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  eligibility: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  lastDate: { type: Date, required: true },
  vacancies: { type: Number, required: true },
  salaryRange: { type: String, required: true },
  fees: {
    general: { type: Number, default: 0 },
    obc: { type: Number, default: 0 },
    sc: { type: Number, default: 0 },
    st: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Job = mongoose.model<IJob>('Job', jobSchema);
