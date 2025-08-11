import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infra/auth.controller';
import { AuthService } from './application/auth.service';
import { AuthUseCase } from './application/auth.use-case';
import { JwtStrategy } from './application/jwt.strategy';
import { JwtService } from './application/jwt.service';
import { AuthRepository } from './infra/auth.repository';
import { LoggerProvider } from '../logger/winstor.logger';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './infra/user.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUseCase,
    JwtService,
    JwtStrategy,
    LoggerProvider,
    {
      provide: 'AuthInterface',
      useClass: AuthRepository,
    },
  ],
  exports: [AuthService, AuthUseCase, JwtService, JwtStrategy],
})
export class AuthModule {}
