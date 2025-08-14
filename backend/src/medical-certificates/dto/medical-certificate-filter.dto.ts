import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class MedicalCertificateFilterDto {
  @IsOptional()
  @IsString()
  collaboratorId?: string;

  @IsOptional()
  @IsString()
  cidCode?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  name?: string;
}
