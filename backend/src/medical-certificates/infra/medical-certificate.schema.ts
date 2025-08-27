import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const MedicalCertificateSchema = new Schema({
  collaboratorId: { type: String, required: true },
  issueDate: { type: Date, required: true },
  leaveDays: { type: Number, required: true },
  cid: [
    {
      cidCode: { type: String, required: true },
      cidDesc: { type: String, required: true },
    },
  ],
  observations: { type: String },
  name: { type: String },
});

export interface MedicalCertificateDocument extends Document {
  collaboratorId: string;
  issueDate: Date;
  leaveDays: number;
  cid: { cidCode: string; cidDesc: string }[];
  observations?: string;
  name: string;
}
