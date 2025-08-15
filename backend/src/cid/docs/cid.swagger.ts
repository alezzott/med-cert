import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiGatewayTimeoutResponse,
} from '@nestjs/swagger';
import { CidResponseDto } from '../dto/oms-response.dto';

export const SearchCidSwagger = applyDecorators(
  ApiOperation({
    summary: 'Buscar CID',
    description: 'Busca informações de CID pelo termo (código ou descrição).',
  }),
  ApiQuery({
    name: 'term',
    required: true,
    description:
      'Termo de busca (código ou parte da descrição do CID). por exmeplo: resfriado / anxiety',
    example: 'ansiedade',
    type: 'string',
  }),
  ApiQuery({
    name: 'locale',
    required: false,
    description:
      'Idioma relacionado ao cid Aceita "pt" (português) ou "en" (inglês).',
    example: 'pt',
    enum: ['pt', 'en'],
    type: 'string',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiResponse({
    status: 200,
    description: 'Lista de CIDs encontrados',
    type: CidResponseDto,
    isArray: true,
  }),
  ApiBadRequestResponse({
    description: 'Termo obrigatório não informado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Termo obrigatório',
        error: 'Bad Request',
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  }),
  ApiGatewayTimeoutResponse({
    description: 'Falha ao buscar CID na OMS',
    schema: {
      example: {
        statusCode: 502,
        message: 'Falha ao buscar CID na OMS',
        error: 'Bad Gateway',
      },
    },
  }),
  ApiNotFoundResponse({
    description: 'Nenhum CID encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Nenhum CID encontrado',
        error: 'Not Found',
      },
    },
  }),
);
