import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { MedicalCertificateRepository } from '../domain/medical-certificate.repository';
import { MedicalCertificate } from '../domain/medical-certificate.entity';
import { MedicalCertificateResponseDto } from '../dto/medical-certificate-response.dto';
import { formatDateTime } from '../../common/utils/date-format.util';

import { Logger } from '@nestjs/common';
import { MedicalCertificateFilterDto } from '../dto/medical-certificate-filter.dto';
import { Collaborator } from 'src/collaborators/domain/collaborator.entity';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
}

@Injectable()
export class MedicalCertificateRepositoryImpl
  implements MedicalCertificateRepository
{
  private readonly logger = new Logger(MedicalCertificateRepositoryImpl.name);
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;

  constructor(
    @InjectModel('MedicalCertificate')
    private readonly medicalCertificateModel: Model<MedicalCertificate>,
    @InjectModel('Collaborator')
    private readonly collaboratorModel: Model<Collaborator>,
  ) {}

  async findAll(
    filter: MedicalCertificateResponseDto,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<MedicalCertificateResponseDto>> {
    this.logger.log(
      `[findAll] Listando atestados com filtros: ${JSON.stringify(filter)}, opções: ${JSON.stringify(options)}`,
      MedicalCertificateRepositoryImpl.name,
    );

    const query = await this.buildQuery(filter);
    const { limit, skip, sortOrder } = this.getPaginationConfig(options);

    const [data, total] = await Promise.all([
      this.medicalCertificateModel
        .find(query)
        .sort({ issueDate: sortOrder as SortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.medicalCertificateModel.countDocuments(query).exec(),
    ]);

    return {
      data: await Promise.all(
        data.map((certificate) => this.toResponseDto(certificate)),
      ),
      total,
    };
  }

  private async buildQuery(filter: MedicalCertificateFilterDto) {
    const query: Record<string, unknown> = {};

    const simpleFilters = ['collaboratorId', 'cidCode'] as const;
    simpleFilters.forEach((field) => {
      if (filter[field]) {
        query[field] = filter[field];
      }
    });

    const dateRange = this.buildDateRange(filter.startDate, filter.endDate);
    if (dateRange) {
      query.issueDate = dateRange;
    }

    if (filter.name) {
      const collaborators = await this.collaboratorModel
        .find({ name: { $regex: filter.name, $options: 'i' } })
        .select('_id')
        .lean();
      const collaboratorIds = collaborators.map((c) => c._id);
      if (collaboratorIds.length > 0) {
        query.collaboratorId = { $in: collaboratorIds };
      } else {
        // Nenhum colaborador encontrado, retorna vazio
        query.collaboratorId = null;
      }
    }

    return query;
  }

  private buildDateRange(
    startDate?: string,
    endDate?: string,
  ): Record<string, Date> | null {
    if (!startDate && !endDate) return null;

    const range: Record<string, Date> = {};

    if (startDate) range.$gte = new Date(startDate);
    if (endDate) range.$lte = new Date(endDate);

    return range;
  }

  private getPaginationConfig(options: PaginationOptions) {
    const page = options.page ?? this.DEFAULT_PAGE;
    const limit = options.limit ?? this.DEFAULT_LIMIT;
    const sortOrder = options.sort === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    return { page, limit, skip, sortOrder };
  }

  private async toResponseDto(
    certificate: MedicalCertificate,
  ): Promise<MedicalCertificateResponseDto> {
    const collaborator = await this.collaboratorModel
      .findById(certificate.collaboratorId)
      .lean();
    return {
      id: certificate.id,
      collaboratorId: certificate.collaboratorId,
      name: collaborator?.name || '',
      cidCode: certificate.cidCode,
      issueDate: formatDateTime(new Date(certificate.issueDate)),
      leaveDays: certificate.leaveDays,
      observations: certificate.observations,
    };
  }

  async create(
    certificate: MedicalCertificate,
  ): Promise<MedicalCertificateResponseDto> {
    const created = new this.medicalCertificateModel({
      collaboratorId: certificate.collaboratorId,
      issueDate: certificate.issueDate,
      leaveDays: certificate.leaveDays,
      cidCode: certificate.cidCode,
      name: certificate.name,
      observations: certificate.observations,
    });
    const saved = await created.save();
    return this.toResponseDto(saved);
  }
}
