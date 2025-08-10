import { User } from './user.entity';

export interface AuthInterface {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
