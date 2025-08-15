import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateMedicalCertificateDto } from '../dto/medical-certificate-create.dto';
import { MedicalCertificateResponseDto } from '../dto/medical-certificate-response.dto';

export const CreateMedicalCertificateSwagger = applyDecorators(
  ApiOperation({
    summary: 'Criar atestado médico',
    description: 'Cria um novo atestado médico para um colaborador',
  }),
  ApiBody({
    type: CreateMedicalCertificateDto,
    description: 'Dados para criação do atestado médico',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiCreatedResponse({
    description: 'Atestado médico criado com sucesso',
    type: MedicalCertificateResponseDto,
  }),
  ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'ID do colaborador é obrigatório',
          'CID é obrigatório',
          'Data de início deve ser uma data válida',
          'Nome do médico é obrigatório',
        ],
        error: 'Bad Request',
      },
    },
  }),
  ApiNotFoundResponse({
    description: 'Colaborador não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Colaborador não encontrado',
        error: 'Not Found',
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  }),
  ApiForbiddenResponse({
    description: 'Usuário não possui permissão para esta ação',
  }),
);

export const GetAllMedicalCertificatesSwagger = applyDecorators(
  ApiOperation({
    summary: 'Listar atestados médicos',
    description: 'Retorna uma lista paginada e filtrada de atestados médicos',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiQuery({
    name: 'collaboratorId',
    required: false,
    description: 'Filtrar por ID do colaborador',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  }),
  ApiQuery({
    name: 'cidCode',
    required: false,
    description: 'Filtrar por código CID',
    example: 'Z76.3',
    type: 'string',
  }),
  ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filtrar por data de início (a partir de)',
    example: '2025-08-01',
    type: 'string',
    format: 'date',
  }),
  ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filtrar por data de fim (até)',
    example: '2025-08-31',
    type: 'string',
    format: 'date',
  }),
  ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    example: 1,
    type: 'number',
    minimum: 1,
  }),
  ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 10)',
    example: 10,
    type: 'number',
    minimum: 1,
    maximum: 100,
  }),
  ApiQuery({
    name: 'sort',
    required: false,
    description: 'Ordenação dos resultados por data de criação',
    example: 'desc',
    enum: ['asc', 'desc'],
  }),
  ApiResponse({
    status: 200,
    description: 'Lista de atestados médicos retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MedicalCertificateResponseDto' },
        },
        total: {
          type: 'number',
          description: 'Total de registros encontrados',
          example: 50,
        },
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  }),
);

export const GetMedicalCertificateByIdSwagger = applyDecorators(
  ApiOperation({
    summary: 'Buscar atestado médico por ID',
    description: 'Retorna os dados de um atestado médico específico',
  }),
  ApiParam({
    name: 'id',
    description: 'ID do atestado médico',
    example: '507f1f77bcf86cd799439011',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiResponse({
    status: 200,
    description: 'Atestado médico encontrado',
    type: MedicalCertificateResponseDto,
  }),
  ApiNotFoundResponse({
    description: 'Atestado médico não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Atestado médico não encontrado',
        error: 'Not Found',
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  }),
);
