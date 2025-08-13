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
    cache = { get: jest.fn(), set: jest.fn() } as any;
    omsClient = { fetchToken: jest.fn(), searchCid: jest.fn() } as any;
    configService = { get: jest.fn() } as any;
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
});
