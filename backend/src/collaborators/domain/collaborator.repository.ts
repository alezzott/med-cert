import { Collaborator } from './collaborator.entity';

export interface CollaboratorRepository {
  create(collaborator: Collaborator): Promise<Collaborator>;
  findById(id: string): Promise<Collaborator | null>;
  findByEmail(email: string): Promise<Collaborator | null>;
  findAll(): Promise<Collaborator[]>;
  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ collaborators: Collaborator[]; total: number }>;
  updateStatus(id: string, status: string): Promise<Collaborator | null>;
  findByCpf(cpf: string): Promise<Collaborator | null>;
}
