/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CidController } from '../infra/oms.controller';
import { OmsService } from '../application/oms.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('CidController (integração)', () => {
  let controller: CidController;
  let service: OmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CidController],
      providers: [
        {
          provide: OmsService,
          useValue: {
            searchCid: jest.fn(function (this: void) {}),
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
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();
    controller = module.get<CidController>(CidController);
    service = module.get<OmsService>(OmsService);
  });

  it('deve buscar CID e retornar resultado', async () => {
    const mockResult = [{ code: 'A00', title: 'Cólera' }];
    (service.searchCid as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.searchCid('Cólera');
    expect(result).toEqual(mockResult);
    expect(service.searchCid).toHaveBeenCalledWith('Cólera', undefined);
  });

  it('deve tratar erro do serviço', async () => {
    (service.searchCid as jest.Mock).mockRejectedValue(new Error('Erro OMS'));
    await expect(controller.searchCid('X')).rejects.toThrow(
      'Falha ao buscar CID na OMS',
    );
  });
});
