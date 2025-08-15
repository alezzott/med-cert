import { ApiProperty } from '@nestjs/swagger';

export interface OmsResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export class CidResponseDto {
  @ApiProperty({
    description: 'Código CID',
    example: 'Z76.3',
  })
  code: string;

  @ApiProperty({
    description: 'Título do CID',
    example: 'Pessoa saudável acompanhando pessoa doente',
  })
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do CID',
    example: 'Descrição completa do CID',
    required: false,
  })
  description?: string;
}
