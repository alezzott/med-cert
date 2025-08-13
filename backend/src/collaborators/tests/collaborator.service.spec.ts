import { CollaboratorService } from '../application/collaborator.service';
import { CollaboratorRepository } from '../domain/collaborator.repository';
import {
  Collaborator,
  CollaboratorRole,
  CollaboratorStatus,
} from '../domain/collaborator.entity';

describe('CollaboratorService', () => {
  let service: CollaboratorService;
  let repository: CollaboratorRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
      findByCpf: jest.fn(),
      findByEmail: jest.fn(),
    };
    service = new CollaboratorService(repository, console);
  });

  it('deve criar colaborador', async () => {
    const collaborator = new Collaborator(
      '1',
      'Nome',
      'email',
      'cpf',
      new Date(),
      CollaboratorStatus.ACTIVE,
      CollaboratorRole.COLLABORATOR,
    );
    (repository.create as jest.Mock).mockResolvedValue(collaborator);
    expect(await service.create(collaborator)).toBe(collaborator);
  });

  it('deve buscar colaborador por id', async () => {
    const collaborator = new Collaborator(
      '1',
      'Nome',
      'email',
      'cpf',
      new Date(),
      CollaboratorStatus.ACTIVE,
      CollaboratorRole.COLLABORATOR,
    );
    (repository.findById as jest.Mock).mockResolvedValue(collaborator);
    expect(await service.findById('1')).toBe(collaborator);
  });
});
