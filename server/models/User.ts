import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'csc';
  isActive: boolean;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  category?: string;
  nationality?: string;
  qualification?: string;
  passingYear?: string;
  kycVerified: boolean;
  activePackage?: string;
  totalApplications: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  rewardPoints: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

function generateReferralCode(name: string): string {
  const namePart = name.replace(/\s+/g, '').toUpperCase().slice(0, 6);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${randomPart}`;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'csc'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  fatherName: {
    type: String,
    trim: true,
  },
  motherName: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  nationality: {
    type: String,
    trim: true,
    default: 'Indian',
  },
  qualification: {
    type: String,
    trim: true,
  },
  passingYear: {
    type: String,
    trim: true,
  },
  kycVerified: {
    type: Boolean,
    default: false,
  },
  activePackage: {
    type: String,
  },
  totalApplications: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: String,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  rewardPoints: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    if (!this.referralCode) {
      this.referralCode = generateReferralCode(this.name);
    }
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.name);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
