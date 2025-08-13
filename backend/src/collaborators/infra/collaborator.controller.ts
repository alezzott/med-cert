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

@Controller('collaborators')
export class CollaboratorController {
  constructor(
    private readonly useCase: CollaboratorUseCase,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(
    @Body() dto: CreateCollaboratorDto,
  ): Promise<CollaboratorResponseDto> {
    this.logger.log(`Admin solicitou criação de colaborador: ${dto.email}`);

    const { CPF } = await import('../domain/value-objects/cpf.vo');
    if (!CPF.isValid(dto.cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    const existsEmail = await this.useCase.findByEmail(dto.email);
    if (existsEmail) {
      throw new ConflictException('Já existe um colaborador com esse email.');
    }

    const existsCpf = await this.useCase.findByCpf(dto.cpf);
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
      cpf: collaborator.cpf,
      status: collaborator.status,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: CollaboratorResponseDto[];
    page: number;
    limit?: number;
  }> {
    this.logger.log(
      `Admin solicitou listagem de colaboradores - página: ${page}, limite: ${limit}`,
    );
    const { collaborators } = await this.useCase.listCollaboratorsPaginated(
      page,
      limit,
    );
    return {
      data: collaborators.map((c: CollaboratorResponseDto) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        cpf: c.cpf,
        status: c.status,
      })),
      page,
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findByCpf(
    @Query('cpf') cpf: string,
  ): Promise<CollaboratorResponseDto | null> {
    this.logger.log(`Admin buscou colaborador pelo CPF: ${cpf}`);

    if (!cpf) {
      throw new BadRequestException('CPF é obrigatório');
    }

    const collaborator = await this.useCase.findByCpf(cpf);
    if (!collaborator) {
      throw new NotFoundException(`Colaborador com CPF ${cpf} não encontrado`);
    }

    return {
      id: collaborator.id,
      name: collaborator.name,
      email: collaborator.email,
      cpf: collaborator.cpf,
      status: collaborator.status,
    };
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Body() dto: UpdateStatusDto,
  ): Promise<CollaboratorResponseDto | null> {
    this.logger.log(
      `Admin alterou status do colaborador ${dto.id} para ${dto.status}`,
    );
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
    };
  }
}
