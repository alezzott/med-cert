import { Inject, LoggerService } from '@nestjs/common';
import { CidResponseDto } from '../dto/oms-response.dto';
import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import * as https from 'https';

const OMS_API_BASE = process.env.OMS_API_BASE;
const OMS_TOKEN_URL = process.env.OMS_TOKEN_URL;

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount: number, error: AxiosError) => {
    const retryAfter = error?.response?.headers?.['retry-after'] as
      | string
      | undefined;
    if (error?.response?.status === 429 && retryAfter) {
      return Number(retryAfter) * 1000;
    }
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error: AxiosError) => {
    const status = error?.response?.status;
    return status === 429 || (!!status && status >= 500);
  },
});

export class OmsApiException extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}

export interface OmsTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

type OmsEntity = {
  theCode?: string;
  title?: string;
};

function cleanHtml(text: string): string {
  return typeof text === 'string' ? text.replace(/<[^>]+>/g, '') : '';
}

export class OmsClient {
  constructor(@Inject('Logger') private readonly logger: LoggerService) {}

  async searchCid(
    term: string,
    token: string,
    locale = 'pt',
  ): Promise<CidResponseDto[]> {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const releaseId = '2024-01';
    const linearization = 'mms';
    const url = `${OMS_API_BASE}/release/11/${releaseId}/${linearization}/search?q=${encodeURIComponent(term)}&flatResults=false`;

    this.logger.log(
      `Iniciando busca CID para termo: "${term}", locale: "${locale}"`,
      'OmsClient',
    );
    this.logger.log(`URL de busca: ${url}`, 'OmsClient');

    try {
      const response = await axios.get<{ destinationEntities?: OmsEntity[] }>(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'API-Version': 'v2',
            'Accept-Language': locale,
          },
          timeout: 10000,
          httpsAgent: agent,
        },
      );

      this.logger.log(`Resposta recebida da API OMS`, 'OmsClient');

      const entities: OmsEntity[] = Array.isArray(
        response.data?.destinationEntities,
      )
        ? response.data.destinationEntities
        : [];

      this.logger.log(
        `Quantidade de entidades retornadas: ${entities.length}`,
        'OmsClient',
      );

      return entities.map(
        (item: OmsEntity): CidResponseDto => ({
          code: item.theCode ?? '',
          title: cleanHtml(item.title ?? ''),
          description: cleanHtml(item.title ?? ''),
        }),
      );
    } catch (error: unknown) {
      const err = error as AxiosError;
      this.logger.error(`Erro ao buscar CID: ${err?.message}`, 'OmsClient');
      throw new OmsApiException(
        err?.response?.status ?? 500,
        `Erro de conexão com API OMS: ${err?.message ?? 'Erro desconhecido'}`,
        err,
      );
    }
  }

  async fetchToken(
    clientId: string,
    clientSecret: string,
  ): Promise<OmsTokenResponse> {
    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'icdapi_access',
    });

    try {
      if (!OMS_TOKEN_URL) {
        throw new OmsApiException(
          500,
          'OMS_TOKEN_URL não está definido nas variáveis de ambiente',
        );
      }

      const response = await axios.post<OmsTokenResponse>(OMS_TOKEN_URL, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      const dataRaw = response.data;
      if (
        !dataRaw ||
        typeof dataRaw.access_token !== 'string' ||
        typeof dataRaw.expires_in !== 'number'
      ) {
        throw new OmsApiException(
          response.status,
          'Resposta inválida ao obter token OMS',
          dataRaw,
        );
      }

      const token: OmsTokenResponse = {
        access_token: dataRaw.access_token,
        expires_in: dataRaw.expires_in,
        token_type:
          typeof dataRaw.token_type === 'string' ? dataRaw.token_type : '',
        scope: typeof dataRaw.scope === 'string' ? dataRaw.scope : undefined,
      };

      return token;
    } catch (error: unknown) {
      const err = error as AxiosError;
      this.logger.error(
        `Erro ao obter token OMS: ${err?.message}`,
        'OmsClient',
      );
      throw new OmsApiException(
        err?.response?.status ?? 502,
        err?.message ?? 'Falha ao obter token OMS',
        err?.response?.data,
      );
    }
  }
}
