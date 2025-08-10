import { Injectable } from '@nestjs/common';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthService } from './auth.service';

@Injectable()
export class AuthUseCase {
  constructor(private readonly authService: AuthService) {}

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.validateUser(loginDto);
  }
}
