import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const MedicalCertificateSchema = new Schema({
  collaboratorId: { type: String, required: true },
  issueDate: { type: Date, required: true },
  leaveDays: { type: Number, required: true },
  cidCode: { type: String, required: true },
  observations: { type: String },
  name: { type: String },
});

export interface MedicalCertificateDocument extends Document {
  collaboratorId: string;
  issueDate: Date;
  leaveDays: number;
  cidCode: string;
  observations?: string;
  name: string;
}
