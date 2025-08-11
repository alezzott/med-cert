import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CollaboratorStatus } from '../domain/collaborator.entity';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEnum(CollaboratorStatus)
  status: CollaboratorStatus;
}
