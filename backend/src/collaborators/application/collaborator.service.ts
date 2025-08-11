import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { CollaboratorRepository } from '../domain/collaborator.repository';
import { Collaborator } from '../domain/collaborator.entity';

@Injectable()
export class CollaboratorService {
  constructor(
    @Inject('CollaboratorRepository')
    private readonly collaboratorRepository: CollaboratorRepository,
    @Inject('Logger')
    private readonly logger: LoggerService,
  ) {}

  async create(collaborator: Collaborator): Promise<Collaborator> {
    this.logger.log(`Criando colaborador: ${collaborator.email}`);
    return this.collaboratorRepository.create(collaborator);
  }

  async findById(id: string): Promise<Collaborator | null> {
    this.logger.log(`Buscando colaborador por ID: ${id}`);
    return this.collaboratorRepository.findById(id);
  }

  async findAll(): Promise<Collaborator[]> {
    this.logger.log('Listando todos os colaboradores');
    return this.collaboratorRepository.findAll();
  }

  async updateStatus(id: string, status: string): Promise<Collaborator | null> {
    this.logger.log(`Atualizando status do colaborador ${id} para ${status}`);
    return this.collaboratorRepository.updateStatus(id, status);
  }

  async findByEmail(email: string): Promise<Collaborator | null> {
    return this.collaboratorRepository.findByEmail(email);
  }
}
