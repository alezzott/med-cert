import { ApiProperty } from '@nestjs/swagger';

export class MedicalCertificateResponseDto {
  @ApiProperty({
    description: 'ID único do atestado médico',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'ID do colaborador',
    example: '507f1f77bcf86cd799439011',
  })
  collaboratorId: string;

  @ApiProperty({
    description: 'Nome do colaborador',
    example: 'João Silva Santos',
  })
  name: string;

  @ApiProperty({
    description: 'CID (Código Internacional de Doenças)',
    example: 'Z76.3',
  })
  cidCode: string;

  @ApiProperty({
    description: 'Data de emissão do atestado',
    example: '2025-08-15',
    format: 'date',
  })
  issueDate: string;

  @ApiProperty({
    description: 'Número de dias de afastamento',
    example: 3,
  })
  leaveDays: number;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Paciente deve manter repouso absoluto',
    nullable: true,
  })
  observations?: string;
}
