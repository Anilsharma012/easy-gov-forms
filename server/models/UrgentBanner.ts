import mongoose, { Schema, Document } from 'mongoose';

export interface IUrgentBanner extends Document {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const UrgentBannerSchema = new Schema<IUrgentBanner>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, default: 'Check Status' },
    buttonLink: { type: String, default: '/govt-jobs' },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUrgentBanner>('UrgentBanner', UrgentBannerSchema);
