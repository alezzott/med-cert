import { LoggerService } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { JwtService } from '../application/jwt.service';
import { AuthInterface } from '../domain/auth.interface';
import { User } from '../domain/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthInterface;
  let jwtService: JwtService;

  beforeEach(() => {
    authRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      generateToken: jest.fn(),
      secret: 'mock-secret',
      expiresIn: 14400,
      logger: { log: jest.fn(), warn: jest.fn() },
    } as unknown as JwtService;
    const loggerMock: LoggerService = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    service = new AuthService(authRepository, jwtService, loggerMock);
  });

  it('deve lançar erro se usuário não existir', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(
      service.validateUser({ email: 'x@x.com', password: '123456' }),
    ).rejects.toThrow('Usuário não encontrado');
  });

  it('deve retornar token ao autenticar usuário válido', async () => {
    const user = new User('1', 'email', 'senha', 'Nome', 'ADMIN');
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(user);
    (jwtService.generateToken as jest.Mock).mockReturnValue('token');
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
    const result = await service.validateUser({
      email: 'email',
      password: 'senha',
    });
    expect(result.accessToken).toBe('token');
  });
});
