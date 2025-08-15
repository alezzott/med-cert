import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class MedicalCertificateFilterDto {
  @ApiProperty({
    description: 'ID do colaborador para filtrar',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  collaboratorId?: string;

  @ApiProperty({
    description: 'Código CID para filtrar',
    example: 'Z76.3',
    required: false,
  })
  @IsOptional()
  @IsString()
  cidCode?: string;

  @ApiProperty({
    description: 'Data de início para filtro (a partir de)',
    example: '2025-08-01',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data de fim para filtro (até)',
    example: '2025-08-31',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Número da página',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Itens por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Ordenação dos resultados',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Nome do colaborador para filtrar',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
