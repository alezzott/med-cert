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
import { User } from '../domain/user.entity';

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
    this.logger.log(`Resultado da busca do usuário: ${JSON.stringify(user)}`);
    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${loginDto.email}`);
      throw new UnauthorizedException('Usuário não encontrado');
    }
    this.logger.log(`Senha informada: ${loginDto.password}`);
    this.logger.log(`Senha armazenada (hash): ${user.password}`);
    const isPasswordValid: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    this.logger.log(
      `Resultado da validação da senha para ${loginDto.email}: ${isPasswordValid}`,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Senha inválida para: ${loginDto.email}`);
      throw new UnauthorizedException('Senha inválida');
    }

    const accessToken = this.jwtService.generateToken(user);
    this.logger.log(`Resultado da validação da senha para ${accessToken}`);
    this.logger.log(`Login bem-sucedido para: ${loginDto.email}`);
    return {
      accessToken,
      expiresIn: 14400,
    };
  }

  async findByEmail(email: string) {
    return this.authRepository.findByEmail(email);
  }

  async createAdmin(dto: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const admin = new User('', dto.email, hashedPassword, dto.name, 'ADMIN');
    return this.authRepository.save(admin);
  }
}
