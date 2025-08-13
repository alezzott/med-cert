import { OmsService } from './../../cid/application/oms.service';
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { MedicalCertificateRepository } from '../domain/medical-certificate.repository';
import { MedicalCertificateFilterDto } from '../dto/medical-certificate-filter.dto';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';
import { MedicalCertificate } from '../domain/medical-certificate.entity';
import { MedicalCertificateResponseDto } from '../dto/medical-certificate-response.dto';

interface PaginationOptions {
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
}

interface FilterParams {
  collaboratorId?: string;
  cidCode?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class MedicalCertificateService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;
  private readonly DEFAULT_SORT = 'desc';

  constructor(
    @Inject('MedicalCertificateRepository')
    private readonly repository: MedicalCertificateRepository,
    @Inject('Logger') private readonly logger: LoggerService,
    private readonly omsService: OmsService,
  ) {}

  async findAll(filter: MedicalCertificateFilterDto) {
    this.logFindAllOperation();

    const filterParams = this.buildFilterParams(filter);
    const paginationOptions = this.buildPaginationOptions(filter);

    return this.repository.findAll(filterParams, paginationOptions);
  }

  async create(
    dto: CreateMedicalCertificateDto,
  ): Promise<MedicalCertificateResponseDto> {
    this.logCreateOperation();

    const certificate = this.createCertificateEntity(dto);
    return this.repository.create(certificate);
  }

  private logFindAllOperation(): void {
    this.logger.log(
      '[findAll] Buscando atestados com filtros',
      'MedicalCertificateService',
    );
  }

  private logCreateOperation(): void {
    this.logger.log(
      '[create] Criando novo atestado',
      'MedicalCertificateService',
    );
  }

  private buildFilterParams(filter: MedicalCertificateFilterDto): FilterParams {
    return {
      collaboratorId: filter.collaboratorId,
      cidCode: filter.cidCode,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    };
  }

  private buildPaginationOptions(
    filter: MedicalCertificateFilterDto,
  ): PaginationOptions {
    return {
      page: filter.page ?? this.DEFAULT_PAGE,
      limit: filter.limit ?? this.DEFAULT_LIMIT,
      sort: filter.sort ?? this.DEFAULT_SORT,
    };
  }

  private createCertificateEntity(
    dto: CreateMedicalCertificateDto,
  ): MedicalCertificate {
    return new MedicalCertificate(
      crypto.randomUUID(),
      dto.collaboratorId,
      new Date(dto.issueDate),
      dto.leaveDays,
      dto.cidCode,
      dto.observations,
    );
  }
}
