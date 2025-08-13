import { MedicalCertificateResponseDto } from '../dto/medical-certificate-response.dto';
import { MedicalCertificate } from './medical-certificate.entity';

export interface MedicalCertificateRepository {
  findAll(
    filter: {
      collaboratorId?: string;
      cidCode?: string;
      startDate?: Date;
      endDate?: Date;
    },
    options: {
      page?: number;
      limit?: number;
      sort?: 'asc' | 'desc';
    },
  ): Promise<{
    data: MedicalCertificateResponseDto[];
    total: number;
  }>;

  create(
    certificate: MedicalCertificate,
  ): Promise<MedicalCertificateResponseDto>;
}
