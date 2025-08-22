import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Inject,
  LoggerService,
  ConflictException,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/guards/jwt-auth.guard';
import { Roles } from '../../auth/roles/roles.decorator';
import { RolesGuard } from '../../auth/infra/guards/roles.guard';
import { CollaboratorUseCase } from '../application/collaborator.use-case';
import { CreateCollaboratorDto } from '../dto/create-collaborator.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { CollaboratorResponseDto } from '../dto/collaborator-response.dto';
import { formatDateTime } from '../../common/utils/date-format.util';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateCollaboratorSwagger,
  GetAllCollaboratorsSwagger,
  SearchCollaboratorSwagger,
  UpdateCollaboratorStatusSwagger,
} from '../docs/collaborators.swagger';
import { CPF, sanitizeCpf } from '../domain/value-objects/cpf.vo';

@ApiTags('collaborators')
@Controller('collaborators')
export class CollaboratorController {
  constructor(
    private readonly useCase: CollaboratorUseCase,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @CreateCollaboratorSwagger
  async create(
    @Body() dto: CreateCollaboratorDto,
  ): Promise<CollaboratorResponseDto> {
    this.logger.log(`Admin solicitou criação de colaborador: ${dto.email}`);

    const sanitizedCpf = sanitizeCpf(dto.cpf);
    if (!CPF.isValid(sanitizedCpf)) {
      throw new BadRequestException('CPF inválido');
    }

    const existsEmail = await this.useCase.findByEmail(dto.email);
    if (existsEmail) {
      throw new ConflictException('Já existe um colaborador com esse email.');
    }

    const existsCpf = await this.useCase.findByCpfExists(dto.cpf);
    if (existsCpf) {
      throw new ConflictException('Já existe um colaborador com esse CPF.');
    }

    const collaborator = await this.useCase.createCollaborator({
      ...dto,
      birthDate: new Date(dto.birthDate),
    });
    this.logger.log(`Novos dados criados ${JSON.stringify(collaborator)}`);

    return {
      id: collaborator.id,
      name: collaborator.name,
      email: collaborator.email,
      cpf: sanitizedCpf,
      status: collaborator.status,
      birthDate: formatDateTime(collaborator.birthDate),
      createdAt: collaborator.createdAt
        ? formatDateTime(collaborator.createdAt)
        : '',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @GetAllCollaboratorsSwagger
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ): Promise<{
    data: CollaboratorResponseDto[];
    page: number;
    limit?: number;
    total?: number;
    status?: string;
  }> {
    this.logger.log(
      `Admin solicitou listagem de colaboradores - página: ${page}, limite: ${limit}`,
    );
    const { collaborators, total } =
      await this.useCase.listCollaboratorsPaginated(page, limit, status);
    return {
      data: collaborators.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        cpf: c.cpf,
        status: c.status,
        birthDate: formatDateTime(c.birthDate),
        createdAt: c.createdAt ? formatDateTime(c.createdAt) : '',
      })),
      page,
      total,
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @SearchCollaboratorSwagger
  async findByCpf(
    @Query('cpf') cpf?: string,
    @Query('name') name?: string,
  ): Promise<CollaboratorResponseDto[]> {
    this.logger.log(`Admin buscou colaborador pelo CPF: ${cpf} ou ${name}`);

    if (!cpf && !name) {
      throw new BadRequestException('CPF ou nome do colaborador é obrigatório');
    }

    const collaborators = await this.useCase.findByCpf(cpf, name);
    if (!collaborators || collaborators.length === 0) {
      throw new NotFoundException(
        `Colaborador com CPF ${cpf} ou nome ${name} não encontrado`,
      );
    }

    return collaborators.map((collaborator) => ({
      id: collaborator.id,
      name: collaborator.name,
      email: collaborator.email,
      cpf: collaborator.cpf,
      status: collaborator.status,
      birthDate: formatDateTime(collaborator.birthDate),
      createdAt: collaborator.createdAt
        ? formatDateTime(collaborator.createdAt)
        : '',
    }));
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UpdateCollaboratorStatusSwagger
  async updateStatus(
    @Body() dto: UpdateStatusDto,
  ): Promise<CollaboratorResponseDto | null> {
    this.logger.log(
      `Admin alterou status do colaborador ${dto.id} para ${dto.status}`,
    );
    const exists = await this.useCase.findById(dto.id);
    if (!exists) {
      throw new NotFoundException(`Colaborador com id não encontrado`);
    }
    const collaborator = await this.useCase.updateCollaboratorStatus(
      dto.id,
      dto.status,
    );
    if (!collaborator) return null;
    return {
      id: collaborator.id,
      name: collaborator.name,
      email: collaborator.email,
      cpf: collaborator.cpf,
      status: collaborator.status,
      birthDate: formatDateTime(collaborator.birthDate),
    };
  }
}
