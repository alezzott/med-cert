import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { AuthInterface } from '../domain/auth.interface';

@Injectable()
export class AuthRepository implements AuthInterface {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc
      ? new User(
          doc._id.toString(),
          doc.email,
          doc.password,
          doc.name,
          doc.role,
        )
      : null;
  }

  async save(user: User): Promise<void> {
    const created = new this.userModel(user);
    await created.save();
  }
}
