import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorStatus } from '../domain/collaborator.entity';

export class CollaboratorResponseDto {
  @ApiProperty({
    description: 'ID único do colaborador',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do colaborador',
    example: 'João Silva Santos',
  })
  name: string;

  @ApiProperty({
    description: 'Email do colaborador',
    example: 'joao.silva@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'CPF do colaborador (formatado)',
    example: '123.456.789-01',
  })
  cpf: string;

  @ApiProperty({
    description: 'Status do colaborador',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE'],
  })
  status: CollaboratorStatus;

  @ApiProperty({
    description: 'Aniversario do colaborador',
    example: '2025-08-15T15:45:00.000Z',
  })
  birthDate: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-08-15T10:30:00.000Z',
  })
  createdAt?: string;
}
