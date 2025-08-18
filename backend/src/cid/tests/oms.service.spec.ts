/* eslint-disable @typescript-eslint/unbound-method */
import { OmsService } from '../application/oms.service';
import { OmsClient } from '../infra/oms.client';
import { Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

describe('OmsService', () => {
  let service: OmsService;
  let cache: Cache;
  let omsClient: OmsClient;
  let configService: ConfigService;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as Cache;

    omsClient = {
      fetchToken: jest.fn(),
      searchCid: jest.fn(),
    } as unknown as OmsClient;

    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;

    service = new OmsService(cache, omsClient, configService);
  });

  it('deve buscar CID e salvar no cache', async () => {
    (cache.get as jest.Mock).mockResolvedValue(undefined);
    (omsClient.fetchToken as jest.Mock).mockResolvedValue({
      access_token: 'token',
      expires_in: 1000,
      token_type: 'Bearer',
    });
    (omsClient.searchCid as jest.Mock).mockResolvedValue([
      { code: 'A00', title: 'Cólera' },
    ]);
    (configService.get as jest.Mock).mockReturnValue('client_id');
    const result = await service.searchCid('Cólera');
    expect(result).toEqual([{ code: 'A00', title: 'Cólera' }]);
    expect(omsClient.searchCid).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalled();
  });

  it('deve retornar resultado do cache se OMS falhar', async () => {
    (cache.get as jest.Mock).mockResolvedValue([
      { code: 'A00', title: 'Cólera' },
    ]);
    (omsClient.fetchToken as jest.Mock).mockRejectedValue(
      new Error('Falha OMS'),
    );
    const result = await service.searchCid('Cólera');
    expect(result).toEqual([{ code: 'A00', title: 'Cólera' }]);
    expect(omsClient.searchCid).not.toHaveBeenCalled();
  });

  it('deve retornar resultado do cache se disponível', async () => {
    (cache.get as jest.Mock).mockResolvedValue([
      { code: 'A00', title: 'Cólera' },
    ]);
    const result = await service.searchCid('Cólera');
    expect(result).toEqual([{ code: 'A00', title: 'Cólera' }]);
    expect(omsClient.searchCid).not.toHaveBeenCalled();
  });

  it('deve tratar erro de rate limit da OMS', async () => {
    (cache.get as jest.Mock).mockResolvedValue(undefined);
    (omsClient.fetchToken as jest.Mock).mockResolvedValue({
      access_token: 'token',
      expires_in: 1000,
      token_type: 'Bearer',
    });
    const rateLimitError = {
      response: { status: 429 },
      message: 'Rate limit',
    };
    (omsClient.searchCid as jest.Mock).mockRejectedValue(rateLimitError);
    await expect(service.searchCid('Cólera')).rejects.toThrow();
  });
});
