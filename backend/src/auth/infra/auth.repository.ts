import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { AuthInterface } from '../domain/auth.interface';

@Injectable()
export class AuthRepository implements AuthInterface {
  private users: User[] = [
    new User(
      '1',
      'admin@teste.com',
      '$2b$10$$2b$10$uQw8kQw8kQw8kQw8kQw8kuQw8kQw8kQw8kQw8kQw8kQw8kQw8kQw8k',
      'Admin',
      ['admin'],
    ),
    // Adicione outros usuários conforme necessário
  ];

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) || null);
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
    return Promise.resolve();
  }
}
