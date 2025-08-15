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
} from '@nestjs/swagger';
import { CreateCollaboratorDto } from '../dto/create-collaborator.dto';
import { CollaboratorResponseDto } from '../dto/collaborator-response.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

export const CreateCollaboratorSwagger = applyDecorators(
  ApiOperation({
    summary: 'Criar colaborador',
    description: 'Cria um novo colaborador no sistema',
  }),
  ApiBody({
    type: CreateCollaboratorDto,
    description: 'Dados para criação do colaborador',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiCreatedResponse({
    description: 'Colaborador criado com sucesso',
    type: CollaboratorResponseDto,
  }),
  ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Nome é obrigatório',
          'Email deve ter um formato válido',
          'CPF é obrigatório',
          'Data de nascimento deve ser uma data válida',
          'Role deve ser ADMIN ou COLLABORATOR',
        ],
        error: 'Bad Request',
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

export const GetAllCollaboratorsSwagger = applyDecorators(
  ApiOperation({
    summary: 'Listar colaboradores',
    description: 'Retorna uma lista paginada de colaboradores',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    example: 1,
    type: 'number',
  }),
  ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 10)',
    example: 10,
    type: 'number',
  }),
  ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status',
    enum: ['ACTIVE', 'INACTIVE'],
  }),
  ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nome ou email',
    example: 'João Silva',
  }),
  ApiResponse({
    status: 200,
    description: 'Lista de colaboradores retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CollaboratorResponseDto' },
        },
        total: {
          type: 'number',
          description: 'Total de registros',
          example: 100,
        },
        page: {
          type: 'number',
          description: 'Página atual',
          example: 1,
        },
        totalPages: {
          type: 'number',
          description: 'Total de páginas',
          example: 10,
        },
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  }),
);

export const SearchCollaboratorSwagger = applyDecorators(
  ApiOperation({
    summary: 'Buscar colaborador por CPF ou nome',
    description:
      'Busca um colaborador específico usando CPF ou nome. Pelo menos um dos parâmetros deve ser fornecido.',
  }),
  ApiQuery({
    name: 'cpf',
    required: false,
    description: 'CPF do colaborador (com ou sem formatação)',
    example: '12345678901',
    type: 'string',
  }),
  ApiQuery({
    name: 'name',
    required: false,
    description: 'Nome completo ou parcial do colaborador',
    example: 'João Silva',
    type: 'string',
  }),
  ApiBearerAuth('JWT-auth'),
  ApiResponse({
    status: 200,
    description: 'Colaborador encontrado',
    type: CollaboratorResponseDto,
  }),
  ApiBadRequestResponse({
    description: 'Nenhum parâmetro de busca fornecido',
    schema: {
      example: {
        statusCode: 400,
        message: 'CPF o nome do colaborar é obrigatório',
        error: 'Bad Request',
      },
    },
  }),
  ApiNotFoundResponse({
    description: 'Colaborador não encontrado com os critérios fornecidos',
    schema: {
      example: {
        statusCode: 404,
        message: 'Colaborador com CPF 12345678901 ou João Silva não encontrado',
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

export const UpdateCollaboratorStatusSwagger = applyDecorators(
  ApiOperation({
    summary: 'Atualizar status do colaborador',
    description: 'Altera o status de um colaborador (ativo/inativo)',
  }),
  ApiBody({
    type: UpdateStatusDto,
    description: 'ID do colaborador e novo status',
    examples: {
      example1: {
        summary: 'Ativar colaborador',
        value: {
          id: '689cfce9f00842d614f168aa',
          status: 'ACTIVE',
        },
      },
      example2: {
        summary: 'Desativar colaborador',
        value: {
          id: '689cfce9f00842d614f168aa',
          status: 'INACTIVE',
        },
      },
    },
  }),
  ApiBearerAuth('JWT-auth'),
  ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
    type: CollaboratorResponseDto,
  }),
  ApiNotFoundResponse({
    description: 'Colaborador não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Colaborador com ID 689cfce9f00842d614f168aa não encontrado',
        error: 'Not Found',
      },
    },
  }),
  ApiBadRequestResponse({
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['ID é obrigatório', 'Status deve ser ACTIVE ou INACTIVE'],
        error: 'Bad Request',
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
