import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { CollaboratorRepository } from '../domain/collaborator.repository';
import { Collaborator } from '../domain/collaborator.entity';
import { formatDateTime } from '../../common/utils/date-format.util';

@Injectable()
export class CollaboratorService {
  constructor(
    @Inject('CollaboratorRepository')
    private readonly collaboratorRepository: CollaboratorRepository,
    @Inject('Logger')
    private readonly logger: LoggerService,
  ) {}

  async create(collaborator: Collaborator): Promise<Collaborator> {
    const now = new Date();
    this.logger.log(
      `Criando colaborador: ${collaborator.email} em ${formatDateTime(now)}`,
    );
    const collaboratorWithDate = new Collaborator(
      collaborator.id,
      collaborator.name,
      collaborator.email,
      collaborator.cpf,
      collaborator.birthDate,
      collaborator.status,
      collaborator.role,
      now,
    );
    return await this.collaboratorRepository.create(collaboratorWithDate);
  }

  async findById(id: string): Promise<Collaborator | null> {
    this.logger.log(`Buscando colaborador por ID: ${id}`);
    return this.collaboratorRepository.findById(id);
  }

  async findAll(): Promise<Collaborator[]> {
    this.logger.log('Listando todos os colaboradores');
    return this.collaboratorRepository.findAll();
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ collaborators: Collaborator[]; total: number }> {
    this.logger.log(
      `Listando colaboradores paginados - página: ${page}, limite: ${limit}`,
    );
    return await this.collaboratorRepository.findAllPaginated(page, limit);
  }

  async updateStatus(id: string, status: string): Promise<Collaborator | null> {
    this.logger.log(`Atualizando status do colaborador ${id} para ${status}`);
    return this.collaboratorRepository.updateStatus(id, status);
  }

  async findByEmail(email: string): Promise<Collaborator | null> {
    return this.collaboratorRepository.findByEmail(email);
  }

  async findByCpf(cpf?: string, name?: string): Promise<Collaborator | null> {
    this.logger.log(`Buscando colaborador por CPF: ${cpf} ou nome ${name}`);
    return this.collaboratorRepository.findByCpf(cpf, name);
  }
}
