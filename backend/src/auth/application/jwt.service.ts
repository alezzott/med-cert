import { Inject, Injectable, LoggerService } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../domain/user.entity';

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'default_secret';
  private readonly expiresIn = 14400;

  constructor(@Inject('Logger') private readonly logger: LoggerService) {}

  generateToken(user: User): string {
    this.logger.log(`Gerando token para usuário: ${user.email}`);
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      },
      this.secret,
      { expiresIn: this.expiresIn },
    );
  }
}
