import {
  Controller,
  Get,
  Query,
  Inject,
  LoggerService,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infra/guards/jwt-auth.guard';
import { MedicalCertificateFilterDto } from '../dto/medical-certificate-filter.dto';
import { MedicalCertificateResponseDto } from '../dto/medical-certificate-response.dto';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';
import { MedicalCertificateUseCase } from '../application/medial-certificate.use-case';

@Controller('medical-certificates')
@UseGuards(JwtAuthGuard)
export class MedicalCertificateController {
  constructor(
    private readonly useCase: MedicalCertificateUseCase,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Get()
  findAll(
    @Query() filter: MedicalCertificateFilterDto,
  ): Promise<{ data: MedicalCertificateResponseDto[]; total: number }> {
    this.logger.log(
      'Listando atestados com filtros',
      'MedicalCertificateController',
    );
    return this.useCase.listCertificates(filter);
  }

  @Post()
  async create(@Body() dto: CreateMedicalCertificateDto) {
    this.logger.log('Criando novo atestado', 'MedicalCertificateController');
    return this.useCase.createCertificate(dto);
  }
}
