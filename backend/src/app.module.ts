import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CollaboratorsModule } from './collaborators/collaborator.module';
import { LoggerProvider } from './logger/winstor.logger';

@Module({
  imports: [
    CollaboratorsModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerProvider],
})
export class AppModule {}
