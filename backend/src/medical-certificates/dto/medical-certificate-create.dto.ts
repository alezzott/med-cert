import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateMedicalCertificateDto {
  @ApiProperty({
    description: 'ID do colaborador que receberá o atestado',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty({ message: 'ID do colaborador é obrigatório' })
  @IsString()
  collaboratorId: string;

  @ApiProperty({
    description: 'Data de emissão do atestado',
    example: '2025-08-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Data de emissão é obrigatória' })
  @IsDateString({}, { message: 'Data de emissão deve ser uma data válida' })
  issueDate: string;

  @ApiProperty({
    description: 'Número de dias de afastamento (calculado automaticamente)',
    example: 3,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Dias deve ser um número' })
  @Min(1, { message: 'Mínimo de 1 dia' })
  @Max(365, { message: 'Máximo de 365 dias' })
  leaveDays: number;

  @ApiProperty({
    description:
      'CID (Código Internacional de Doenças) relacionado ao atestado',
    example: 'Z76.3',
  })
  @IsNotEmpty({ message: 'CID é obrigatório' })
  @IsString()
  cidCode: string;
  @ApiProperty({
    description: 'Observações adicionais sobre o atestado',
    example: 'Paciente deve manter repouso absoluto',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
