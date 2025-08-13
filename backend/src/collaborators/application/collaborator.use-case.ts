import { CollaboratorService } from './collaborator.service';
import {
  Collaborator,
  CollaboratorStatus,
  CollaboratorRole,
} from '../domain/collaborator.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CollaboratorUseCase {
  constructor(private readonly collaboratorService: CollaboratorService) {}

  async createCollaborator(dto: {
    name: string;
    email: string;
    cpf: string;
    birthDate: Date;
    role?: 'ADMIN' | 'COLLABORATOR';
  }): Promise<Collaborator> {
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
    );
    return this.collaboratorService.create(collaborator);
  }
  async listCollaborators(): Promise<Collaborator[]> {
    return await this.collaboratorService.findAll();
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

  async findByCpf(cpf: string): Promise<Collaborator | null> {
    return this.collaboratorService.findByCpf(cpf);
  }
}
