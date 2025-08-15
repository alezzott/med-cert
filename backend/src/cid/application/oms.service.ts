import { ConfigService } from '@nestjs/config';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { OmsClient } from '../infra/oms.client';
import { CidResponseDto } from '../dto/oms-response.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

const SEARCH_CACHE_TTL = 3600;
const CODE_CACHE_TTL = 86400;
const OMS_TOKEN_CACHE_KEY = 'oms:token';
const MSG_TOKEN_CONFIG_ERROR =
  'OMS_CLIENT_ID ou OMS_CLIENT_SECRET não configurados';
const MSG_TOKEN_INVALID = 'Token OMS inválido';
const MSG_TOKEN_FETCH_ERROR = 'Falha ao autenticar na OMS';
const MSG_CID_CODE_FETCH_ERROR = 'Falha ao buscar CID por código';

@Injectable()
export class OmsService {
  private readonly logger = new Logger(OmsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly omsClient: OmsClient,
    private readonly configService: ConfigService,
  ) {}

  private getSearchCacheKey(term: string, locale: string = 'pt'): string {
    const normalized = encodeURIComponent(term.toLowerCase().trim());
    return `cid:search:${locale}:${normalized}`;
  }

  private getCodeCacheKey(code: string): string {
    return `cid:code:${code.trim().toUpperCase()}`;
  }

  private async getToken(): Promise<string> {
    const cachedToken =
      await this.cacheManager.get<string>(OMS_TOKEN_CACHE_KEY);
    if (cachedToken) {
      this.logger.log(
        `[getToken] Token OMS obtido do cache: ${cachedToken}`,
        'OmsService',
      );
      return cachedToken;
    }

    const clientId = this.configService.get<string>('OMS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('OMS_CLIENT_SECRET');
    this.logger.debug(
      `[getToken] clientId: ${clientId}, clientSecret: ${clientSecret ? '***' : 'undefined'}`,
      'OmsService',
    );

    if (!clientId || !clientSecret) {
      this.logger.error(`[getToken] ${MSG_TOKEN_CONFIG_ERROR}`, 'OmsService');
      throw new Error(MSG_TOKEN_CONFIG_ERROR);
    }

    try {
      this.logger.log(
        '[getToken] Solicitando novo token à OMS...',
        'OmsService',
      );
      const tokenData = await this.omsClient.fetchToken(clientId, clientSecret);
      this.logger.debug(
        `[getToken] Resposta da OMS: ${JSON.stringify(tokenData)}`,
        'OmsService',
      );

      if (
        !tokenData?.access_token ||
        typeof tokenData.expires_in !== 'number'
      ) {
        this.logger.error(
          `[getToken] ${MSG_TOKEN_INVALID} | tokenData: ${JSON.stringify(tokenData)}`,
          'OmsService',
        );
        throw new Error(MSG_TOKEN_INVALID);
      }

      const ttl = Math.max(tokenData.expires_in - 30, 60);
      await this.cacheManager.set(
        OMS_TOKEN_CACHE_KEY,
        tokenData.access_token,
        ttl,
      );
      this.logger.log(
        `[getToken] Token salvo no cache com TTL: ${ttl}`,
        'OmsService',
      );
      return tokenData.access_token;
    } catch (error) {
      this.logger.error(
        `[getToken] Erro ao obter token OMS: ${error instanceof Error ? error.message : String(error)} | Stack: ${error instanceof Error ? error.stack : ''}`,
        'OmsService',
      );
      throw new Error(MSG_TOKEN_FETCH_ERROR);
    }
  }

  async searchCid(
    term: string,
    locale: string = 'pt',
  ): Promise<CidResponseDto[]> {
    const cacheKey = this.getSearchCacheKey(term, locale);

    const cachedResults =
      await this.cacheManager.get<CidResponseDto[]>(cacheKey);
    if (cachedResults) {
      this.logger.log(
        `[searchCid] Cache HIT para termo: ${term}`,
        'OmsService',
      );
      return cachedResults;
    }

    try {
      this.logger.log(
        `[searchCid] Cache MISS para termo: ${term}`,
        'OmsService',
      );
      const token = await this.getToken();
      const results = await this.omsClient.searchCid(term, token, locale);

      await this.cacheManager.set(cacheKey, results, SEARCH_CACHE_TTL);
      this.logger.log(
        `[searchCid] Resultados salvos no cache para termo: ${term}`,
        'OmsService',
      );

      this.logger.debug(
        `[searchCid] Chave do cache gerada: ${cacheKey}`,
        'OmsService',
      );
      return results;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[searchCid] Erro na busca CID: ${errMsg}`,
        'OmsService',
      );

      const fallbackResults =
        await this.cacheManager.get<CidResponseDto[]>(cacheKey);
      if (fallbackResults) {
        this.logger.warn(
          '[searchCid] Usando resultado do cache por fallback',
          'OmsService',
        );
        return fallbackResults;
      }
      throw new Error(errMsg);
    }
  }

  async getCidByCode(
    code: string,
    locale: string = 'pt',
  ): Promise<CidResponseDto | null> {
    const cacheKey = this.getCodeCacheKey(code);

    const cachedCid = await this.cacheManager.get<CidResponseDto>(cacheKey);
    if (cachedCid) {
      this.logger.log(`Busca CID por código cache HIT: ${code}`);
      return cachedCid;
    }

    try {
      const token = await this.getToken();
      const results = await this.omsClient.searchCid(code, token, locale);

      const cid =
        results.find(
          (item) => item.code.toUpperCase() === code.trim().toUpperCase(),
        ) ?? null;

      if (cid) {
        await this.cacheManager.set(cacheKey, cid, CODE_CACHE_TTL);
        this.logger.log(
          `Busca CID por código cache MISS: ${code} (salvo no cache)`,
        );
      }

      return cid;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);

      console.error(errMsg);

      const fallbackCid = await this.cacheManager.get<CidResponseDto>(cacheKey);
      if (fallbackCid) {
        console.warn('Usando resultado do cache por fallback');
        return fallbackCid;
      }
      throw new Error(MSG_CID_CODE_FETCH_ERROR);
    }
  }
}
