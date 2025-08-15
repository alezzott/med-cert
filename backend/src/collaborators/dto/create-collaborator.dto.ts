import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CollaboratorRole {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
}

export class CreateCollaboratorDto {
  @ApiProperty({
    description: 'Nome completo do colaborador',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do colaborador',
    example: 'joao.silva@empresa.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @ApiProperty({
    description: 'CPF do colaborador (apenas números ou formatado)',
    example: '12345678901',
    pattern: '^[0-9]{11}$|^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$',
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString()
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do colaborador',
    example: '1990-05-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  birthDate: string;

  @ApiProperty({
    description: 'Função do colaborador no sistema',
    example: 'COLLABORATOR',
    enum: CollaboratorRole,
    required: false,
    default: 'COLLABORATOR',
  })
  @IsOptional()
  @IsEnum(CollaboratorRole, {
    message: 'Role deve ser ADMIN ou COLLABORATOR',
  })
  role?: CollaboratorRole;
}
