import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/infra/auth.controller';
import { AuthService } from './auth/application/auth.service';
import { AuthUseCase } from './auth/application/auth.use-case';
import { JwtStrategy } from './auth/application/jwt.strategy';
import { JwtAuthGuard } from './auth/infra/guards/jwt-auth.guard';
import { JwtService } from './auth/application/jwt.service';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { LoggerProvider, WinstonLoggerModule } from './logger/winstor.logger';
import { AuthRepository } from './auth/infra/auth.repository';

@Module({
  imports: [PassportModule, WinstonLoggerModule],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    AuthService,
    AuthUseCase,
    JwtService,
    JwtStrategy,
    LoggerProvider,
    {
      provide: 'AuthInterface',
      useClass: AuthRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
