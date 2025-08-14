import type { CollaboratorStatus } from '@/enums/status.enums';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  cpf: string;
  status: CollaboratorStatus;
  birthDate: string;
  createdAt: string;
  [key: string]: string;
}
