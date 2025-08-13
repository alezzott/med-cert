import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateMedicalCertificateDto {
  @IsString()
  collaboratorId: string;

  @IsDateString()
  issueDate: string;

  @IsInt()
  @Min(1)
  @Max(365)
  leaveDays: number;

  @IsString()
  cidCode: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
