import {
  Injectable,
  UnauthorizedException,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';
import { AuthInterface } from '../domain/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthInterface') private readonly authRepository: AuthInterface,
    private readonly jwtService: JwtService,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  async validateUser(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.log(`Tentativa de login para: ${loginDto.email}`);
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${loginDto.email}`);
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const isPasswordValid: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Senha inválida para: ${loginDto.email}`);
      throw new UnauthorizedException('Senha inválida');
    }
    const accessToken = this.jwtService.generateToken(user);
    this.logger.log(`Login bem-sucedido para: ${loginDto.email}`);
    return {
      accessToken,
      expiresIn: 3600,
    };
  }
}
