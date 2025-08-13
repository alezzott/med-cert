/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../infra/auth.controller';
import { AuthUseCase } from '../application/auth.use-case';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

describe('AuthController (integração)', () => {
  let controller: AuthController;
  let useCase: jest.Mocked<AuthUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthUseCase,
          useValue: {
            login: jest.fn(function (this: void) {}),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    useCase = module.get<AuthUseCase>(AuthUseCase) as jest.Mocked<AuthUseCase>;
  });

  it('deve autenticar usuário e retornar token', async () => {
    const dto: LoginRequestDto = {
      email: 'user@email.com',
      password: '123456',
    };
    const response: LoginResponseDto = {
      accessToken: 'token',
      expiresIn: 14400,
    };
    useCase.login.mockResolvedValue(response);

    const result = await controller.login(dto);
    expect(result).toEqual(response);
    expect(useCase.login).toHaveBeenCalledWith(dto);
  });

  it('deve tratar erro de autenticação', async () => {
    useCase.login.mockRejectedValue(new Error('Credenciais inválidas'));
    await expect(
      controller.login({ email: 'x', password: 'y' }),
    ).rejects.toThrow('Credenciais inválidas');
  });
});
