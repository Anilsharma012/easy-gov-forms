import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderType: 'user' | 'csc' | 'admin' | 'lead';
  receiverId: mongoose.Types.ObjectId;
  receiverType: 'user' | 'csc' | 'admin' | 'lead';
  conversationId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  senderId: { type: Schema.Types.ObjectId, required: true, refPath: 'senderType' },
  senderType: { type: String, enum: ['user', 'csc', 'admin', 'lead'], required: true },
  receiverId: { type: Schema.Types.ObjectId, required: true, refPath: 'receiverType' },
  receiverType: { type: String, enum: ['user', 'csc', 'admin', 'lead'], required: true },
  conversationId: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, senderType: 1 });
chatMessageSchema.index({ receiverId: 1, receiverType: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
