import mongoose, { Document, Schema } from 'mongoose';

export interface ICSCSupportResponse {
  _id?: mongoose.Types.ObjectId;
  responderId: mongoose.Types.ObjectId;
  responderType: 'csc' | 'admin';
  message: string;
  createdAt: Date;
}

export interface ICSCSupportTicket extends Document {
  centerId: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'technical' | 'payment' | 'leads' | 'verification' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  responses: ICSCSupportResponse[];
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema({
  responderId: { type: Schema.Types.ObjectId, required: true },
  responderType: { type: String, enum: ['csc', 'admin'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const cscSupportTicketSchema = new Schema<ICSCSupportTicket>({
  centerId: { type: Schema.Types.ObjectId, ref: 'CSCCenter', required: true },
  ticketNumber: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['technical', 'payment', 'leads', 'verification', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  responses: [responseSchema],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
}, { timestamps: true });

cscSupportTicketSchema.index({ centerId: 1 });
cscSupportTicketSchema.index({ status: 1 });
cscSupportTicketSchema.index({ ticketNumber: 1 });

export const CSCSupportTicket = mongoose.model<ICSCSupportTicket>('CSCSupportTicket', cscSupportTicketSchema);
