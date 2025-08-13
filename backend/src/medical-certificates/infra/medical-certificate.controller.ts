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
import { JwtAuthGuard } from '../../auth/infra/guards/jwt-auth.guard';
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
  async findAll(@Query() filter: MedicalCertificateFilterDto): Promise<{
    data: MedicalCertificateResponseDto[];
    total?: number;
    page?: number;
    limit?: number;
  }> {
    this.logger.log(
      'Listando atestados com filtros',
      'MedicalCertificateController',
    );
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const result = await this.useCase.listCertificates(filter);
    return {
      data: result.data,
      page,
      limit,
    };
  }

  @Post()
  async create(@Body() dto: CreateMedicalCertificateDto) {
    this.logger.log('Criando novo atestado', 'MedicalCertificateController');
    const result = await this.useCase.createCertificate(dto);
    return result;
  }
}
