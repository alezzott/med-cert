/* eslint-disable @typescript-eslint/unbound-method */
import { CollaboratorUseCase } from '../application/collaborator.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorController } from '../infra/collaborator.controller';
import { CollaboratorService } from '../application/collaborator.service';
import { CreateCollaboratorDto } from '../dto/create-collaborator.dto';
import {
  CollaboratorRole,
  CollaboratorStatus,
} from '../domain/collaborator.entity';

describe('CollaboratorController (integração)', () => {
  let controller: CollaboratorController;
  let useCase: jest.Mocked<CollaboratorUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorController],
      providers: [
        {
          provide: CollaboratorService,
          useValue: {
            create: jest.fn(() => {}),
            findById: jest.fn(() => {}),
            findAll: jest.fn(() => {}),
            updateStatus: jest.fn(() => {}),
          },
        },
        {
          provide: CollaboratorUseCase,
          useValue: {
            findByEmail: jest.fn(function (this: void) {}),
            findByCpf: jest.fn(function (this: void) {}),
            createCollaborator: jest.fn(function (this: void) {}),
            listCollaboratorsPaginated: jest.fn(function (this: void) {}),
            updateCollaboratorStatus: jest.fn(function (this: void) {}),
            findById: jest.fn(function (this: void) {}),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
    useCase = module.get<CollaboratorUseCase>(
      CollaboratorUseCase,
    ) as jest.Mocked<CollaboratorUseCase>;
  });

  it('deve criar colaborador', async () => {
    const dto: CreateCollaboratorDto = {
      name: 'João',
      email: 'joao@email.com',
      cpf: '12345678900',
      birthDate: '2000-01-01',
    };
    useCase.findByEmail.mockResolvedValue(null);
    useCase.findByCpf.mockResolvedValue(null);
    useCase.createCollaborator.mockResolvedValue({
      id: '1',
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf,
      birthDate: new Date(dto.birthDate),
      status: CollaboratorStatus.ACTIVE,
      role: CollaboratorRole.COLLABORATOR,
      createdAt: new Date(),
    });

    const result = await controller.create(dto);
    expect(result).toMatchObject({
      id: '1',
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf,
    });
    expect(useCase.createCollaborator).toHaveBeenCalledWith({
      ...dto,
      birthDate: new Date(dto.birthDate),
    });
  });

  it('deve buscar todos os colaboradores', async () => {
    useCase.listCollaboratorsPaginated.mockResolvedValue({
      collaborators: [
        {
          id: '1',
          name: 'João',
          email: 'joao@email.com',
          cpf: '12345678900',
          birthDate: new Date('2000-01-01'),
          status: CollaboratorStatus.ACTIVE,
          role: CollaboratorRole.COLLABORATOR,
          createdAt: new Date(),
        },
      ],
      total: 1,
    });
    const result = await controller.findAll();
    expect(result.data[0]).toMatchObject({ id: '1', name: 'João' });
    expect(useCase.listCollaboratorsPaginated).toHaveBeenCalled();
  });

  it('deve buscar colaborador por cpf', async () => {
    useCase.findByCpf.mockResolvedValue({
      id: '1',
      name: 'João',
      email: 'joao@email.com',
      cpf: '12345678900',
      birthDate: new Date('2000-01-01'),
      status: CollaboratorStatus.ACTIVE,
      role: CollaboratorRole.COLLABORATOR,
      createdAt: new Date(),
    });
    const result = await controller.findByCpf('12345678900');
    expect(result).toMatchObject({ id: '1', name: 'João', cpf: '12345678900' });
    expect(useCase.findByCpf).toHaveBeenCalledWith('12345678900');
  });

  it('deve atualizar status do colaborador', async () => {
    useCase.findById.mockResolvedValue({
      id: '1',
      name: 'João',
      email: 'joao@email.com',
      cpf: '12345678900',
      birthDate: new Date('2000-01-01'),
      status: CollaboratorStatus.ACTIVE,
      role: CollaboratorRole.COLLABORATOR,
      createdAt: new Date(),
    });
    useCase.updateCollaboratorStatus.mockResolvedValue({
      id: '1',
      name: 'João',
      email: 'joao@email.com',
      cpf: '12345678900',
      birthDate: new Date('2000-01-01'),
      status: CollaboratorStatus.INACTIVE,
      role: CollaboratorRole.COLLABORATOR,
    });
    const result = await controller.updateStatus({
      id: '1',
      status: CollaboratorStatus.INACTIVE,
    });
    expect(result).toMatchObject({
      id: '1',
      name: 'João',
      email: 'joao@email.com',
      cpf: '12345678900',
      birthDate: '01/01/2000 - 00:00:00',
      status: CollaboratorStatus.INACTIVE,
    });
    expect(useCase.updateCollaboratorStatus).toHaveBeenCalledWith(
      '1',
      CollaboratorStatus.INACTIVE,
    );
  });
});
