import { Schema, Document, Types } from 'mongoose';
import { CollaboratorStatus } from '../domain/collaborator.entity';

export const CollaboratorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  cpf: { type: String, required: true },
  birthDate: { type: Date, required: true },
  status: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export interface CollaboratorDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  cpf: string;
  birthDate: Date;
  status: CollaboratorStatus;
  role: string;
  createdAt: Date;
}
