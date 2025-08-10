import { IsString, IsNumber } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  accessToken: string;

  @IsNumber()
  expiresIn: number;
}
