import { CollaboratorService } from './collaborator.service';
import {
  Collaborator,
  CollaboratorStatus,
  CollaboratorRole,
} from '../domain/collaborator.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CollaboratorUseCase {
  async findById(id: string): Promise<Collaborator | null> {
    return this.collaboratorService.findById(id);
  }
  constructor(private readonly collaboratorService: CollaboratorService) {}

  async createCollaborator(dto: {
    name: string;
    email: string;
    cpf: string;
    birthDate: Date;
    role?: 'ADMIN' | 'COLLABORATOR';
  }): Promise<Collaborator> {
    const now = new Date();
    const collaborator = new Collaborator(
      '',
      dto.name,
      dto.email,
      dto.cpf,
      dto.birthDate,
      CollaboratorStatus.ACTIVE,
      dto.role === 'ADMIN'
        ? CollaboratorRole.ADMIN
        : CollaboratorRole.COLLABORATOR,
      now,
    );
    return this.collaboratorService.create(collaborator);
  }

  async listCollaborators(): Promise<Collaborator[]> {
    return await this.collaboratorService.findAll();
  }

  async listCollaboratorsPaginated(
    page: number,
    limit: number,
  ): Promise<{ collaborators: Collaborator[]; total: number }> {
    return await this.collaboratorService.findAllPaginated(page, limit);
  }

  async updateCollaboratorStatus(
    id: string,
    status: string,
  ): Promise<Collaborator | null> {
    return this.collaboratorService.updateStatus(id, status);
  }

  async findByEmail(email: string): Promise<Collaborator | null> {
    return this.collaboratorService.findByEmail(email);
  }

  async findByCpf(cpf?: string, name?: string): Promise<Collaborator[]> {
    return this.collaboratorService.findByCpf(cpf, name);
  }

  async findByCpfExists(
    cpf?: string,
    name?: string,
  ): Promise<Collaborator | null> {
    return this.collaboratorService.findByCpfExists(cpf, name);
  }
}
