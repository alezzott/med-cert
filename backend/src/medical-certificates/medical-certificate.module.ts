import { Module } from '@nestjs/common';
import { MedicalCertificateController } from './infra/medical-certificate.controller';
import { MedicalCertificateService } from './application/medical-certificate.service';
import { MedicalCertificateUseCase } from './application/medial-certificate.use-case';
import { MedicalCertificateRepositoryImpl } from './infra/medical-certificate.repository.impl';
import { LoggerProvider } from '../logger/winstor.logger';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalCertificateSchema } from './infra/medical-certificate.schema';
import { CidModule } from '../cid/cid.module';
import { CollaboratorSchema } from '../collaborators/infra/collaborator.schema';

@Module({
  imports: [
    CacheModule.register(),
    CidModule,
    MongooseModule.forFeature([
      { name: 'MedicalCertificate', schema: MedicalCertificateSchema },
      { name: 'Collaborator', schema: CollaboratorSchema },
    ]),
  ],
  controllers: [MedicalCertificateController],
  providers: [
    MedicalCertificateService,
    MedicalCertificateUseCase,
    LoggerProvider,
    {
      provide: 'MedicalCertificateRepository',
      useClass: MedicalCertificateRepositoryImpl,
    },
  ],
  exports: [MedicalCertificateService],
})
export class MedicalCertificateModule {}
