import { Controller, Post, Body, Inject, LoggerService } from '@nestjs/common';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthUseCase } from '../application/auth.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUseCase: AuthUseCase,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.log(`Login solicitado para: ${loginDto.email}`);
    return this.authUseCase.login(loginDto);
  }
}
