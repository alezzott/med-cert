import { CollaboratorStatus } from '../domain/collaborator.entity';

export class CollaboratorResponseDto {
  id: string;
  name: string;
  email: string;
  cpf: string;
  status: CollaboratorStatus;
}
