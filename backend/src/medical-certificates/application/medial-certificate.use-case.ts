import { Injectable } from '@nestjs/common';
import { MedicalCertificateService } from './medical-certificate.service';
import { MedicalCertificateFilterDto } from '../dto/medical-certificate-filter.dto';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';

@Injectable()
export class MedicalCertificateUseCase {
  constructor(private readonly service: MedicalCertificateService) {}

  async listCertificates(filter: MedicalCertificateFilterDto) {
    return this.service.findAll(filter);
  }

  async createCertificate(dto: CreateMedicalCertificateDto) {
    return this.service.create(dto);
  }
}
