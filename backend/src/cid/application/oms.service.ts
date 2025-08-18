import { ConfigService } from '@nestjs/config';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { OmsClient } from '../infra/oms.client';
import { CidResponseDto } from '../dto/oms-response.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

const SEARCH_CACHE_TTL = 86400;
const OMS_TOKEN_CACHE_KEY = 'oms:token';
const MSG_TOKEN_CONFIG_ERROR =
  'OMS_CLIENT_ID ou OMS_CLIENT_SECRET não configurados';
const MSG_TOKEN_INVALID = 'Token OMS inválido';
const MSG_TOKEN_FETCH_ERROR = 'Falha ao autenticar na OMS';

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

      const ttl = Math.max(tokenData.expires_in - 300, 300);
      await this.cacheManager.set(
        OMS_TOKEN_CACHE_KEY,
        tokenData.access_token,
        ttl,
      );
      this.logger.log(
        `[getToken] Token salvo no cache com TTL: ${ttl} | Token: ${tokenData.access_token}`,
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

    let token: string | undefined;
    try {
      token = await this.getToken();
    } catch (error) {
      this.logger.warn(
        `[searchCid] Falha ao obter token OMS: ${error instanceof Error ? error.message : String(error)}`,
        'OmsService',
      );
      const fallbackResults =
        await this.cacheManager.get<CidResponseDto[]>(cacheKey);
      if (fallbackResults) {
        this.logger.warn(
          '[searchCid] Usando resultado do cache por fallback (token)',
          'OmsService',
        );
        return fallbackResults;
      }
      throw new Error('Falha ao autenticar na OMS e sem resultado em cache');
    }

    try {
      this.logger.log(
        `[searchCid] Cache MISS para termo: ${term}`,
        'OmsService',
      );
      const results = await this.omsClient.searchCid(term, token, locale);
      this.logger.debug(`Resultados encontrados, ${JSON.stringify(results)}`);

      if (results && results.length > 0) {
        await this.cacheManager.set(cacheKey, results, SEARCH_CACHE_TTL);
        this.logger.log(
          `[searchCid] Resultados salvos no cache para termo: ${term} ${SEARCH_CACHE_TTL}`,
          'OmsService',
        );
      } else {
        this.logger.warn(
          `[searchCid] Nenhum resultado válido retornado da OMS para termo: ${term}. Cache não será atualizado.`,
          'OmsService',
        );
      }

      this.logger.debug(
        `[searchCid] Chave do cache gerada: ${cacheKey}`,
        'OmsService',
      );
      return results;
    } catch (error) {
      const fallbackResults =
        await this.cacheManager.get<CidResponseDto[]>(cacheKey);
      if (fallbackResults) {
        this.logger.warn(
          '[searchCid] Usando resultado do cache por fallback (OMS)',
          'OmsService',
        );
        return fallbackResults;
      }
      throw error;
    }
  }
}
