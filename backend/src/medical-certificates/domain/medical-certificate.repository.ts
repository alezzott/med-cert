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
  ): Promise<{ data: MedicalCertificate[]; total: number }>;

  create(certificate: MedicalCertificate): Promise<MedicalCertificate>;
}
