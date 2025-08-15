import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum CollaboratorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'ID do colaborador',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty({ message: 'ID é obrigatório' })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Novo status do colaborador',
    example: 'INACTIVE',
    enum: CollaboratorStatus,
  })
  @IsEnum(CollaboratorStatus, {
    message: 'Status deve ser ACTIVE ou INACTIVE',
  })
  status: CollaboratorStatus;
}
