/* eslint-disable @typescript-eslint/unbound-method */
import { formatDateTime } from '../../common/utils/date-format.util';
import { MedicalCertificateService } from '../application/medical-certificate.service';
import { MedicalCertificateRepository } from '../domain/medical-certificate.repository';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';

describe('MedicalCertificateService', () => {
  let service: MedicalCertificateService;
  let repository: jest.Mocked<MedicalCertificateRepository>;
  let collaboratorModel: jest.Mocked<any>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
      create: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
    } as jest.Mocked<MedicalCertificateRepository>;

    collaboratorModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          id: 'colab1',
          name: 'Nome do Colaborador',
        }),
      }),
    };

    service = new MedicalCertificateService(
      repository,
      console,
      collaboratorModel,
    );
  });

  it('deve buscar todos os certificados', async () => {
    const mockResult = { data: [], total: 0 };
    repository.findAll.mockResolvedValue(mockResult);
    const result = await service.findAll({});
    expect(result).toEqual(mockResult);
    expect(repository.findAll).toHaveBeenCalledWith(
      {},
      { page: 1, limit: 10, sort: 'desc' },
    );
  });

  it('deve criar certificado médico', async () => {
    const dto: CreateMedicalCertificateDto = {
      collaboratorId: 'colab1',
      issueDate: '2025-08-13',
      leaveDays: 5,
      cidCode: 'A00',
      observations: 'obs',
    };
    const cert = {
      id: expect.any(String) as unknown as string,
      collaboratorId: dto.collaboratorId,
      issueDate: new Date(dto.issueDate),
      leaveDays: dto.leaveDays,
      cidCode: dto.cidCode,
      observations: dto.observations,
    };
    repository.create.mockResolvedValue({
      ...cert,
      name: 'Nome do Colaborador',
      issueDate: formatDateTime(new Date(dto.issueDate)),
    });
    const result = await service.create(dto);
    expect(result).toMatchObject({
      collaboratorId: dto.collaboratorId,
      leaveDays: dto.leaveDays,
      cidCode: dto.cidCode,
      observations: dto.observations,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining(cert),
    );
  });
});
