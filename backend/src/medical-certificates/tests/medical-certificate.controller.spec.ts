/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MedicalCertificateUseCase } from '../application/medial-certificate.use-case';
import { MedicalCertificateController } from '../infra/medical-certificate.controller';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';
import { formatDateTime } from '../../common/utils/date-format.util';

describe('MedicalCertificateController (integração)', () => {
  let controller: MedicalCertificateController;
  let useCase: jest.Mocked<MedicalCertificateUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalCertificateController],
      providers: [
        {
          provide: MedicalCertificateUseCase,
          useValue: {
            createCertificate: jest.fn() as (this: void, ...args: any[]) => any,
            listCertificates: jest.fn() as (this: void, ...args: any[]) => any,
          },
        },
        {
          provide: 'Logger',
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MedicalCertificateController>(
      MedicalCertificateController,
    );
    useCase = module.get<MedicalCertificateUseCase>(
      MedicalCertificateUseCase,
    ) as jest.Mocked<MedicalCertificateUseCase>;
  });

  it('deve criar certificado médico', async () => {
    const dto: CreateMedicalCertificateDto = {
      collaboratorId: 'colab1',
      issueDate: '2025-08-13',
      leaveDays: 5,
      cidCode: 'A00',
      observations: 'Paciente: Maria, Médico: Dr. João',
    };
    useCase.createCertificate.mockResolvedValue({
      id: '1',
      collaboratorId: dto.collaboratorId,
      issueDate: formatDateTime(new Date(dto.issueDate)),
      leaveDays: dto.leaveDays,
      cidCode: dto.cidCode,
      observations: dto.observations,
    });

    const result = await controller.create(dto);
    expect(result).toEqual({
      id: '1',
      collaboratorId: dto.collaboratorId,
      issueDate: formatDateTime(new Date(dto.issueDate)),
      leaveDays: dto.leaveDays,
      cidCode: dto.cidCode,
      observations: dto.observations,
    });
    expect(useCase.createCertificate).toHaveBeenCalledWith(dto);
  });

  it('deve buscar todos os certificados com filtro', async () => {
    const filter = {
      collaboratorId: 'colab1',
      cidCode: 'A00',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
    };
    const mockResult = {
      data: [
        {
          id: '1',
          collaboratorId: 'colab1',
          issueDate: formatDateTime(new Date('2025-08-13')),
          leaveDays: 5,
          cidCode: 'A00',
          observations: 'Paciente: Maria, Médico: Dr. João',
        },
      ],
      total: 1,
      limit: 10,
      page: 1,
    };
    useCase.listCertificates.mockResolvedValue(mockResult);

    const result = await controller.findAll(filter);
    expect(result).toEqual(mockResult);
    expect(useCase.listCertificates).toHaveBeenCalledWith(filter);
  });
});
