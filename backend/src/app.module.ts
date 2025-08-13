import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CollaboratorsModule } from './collaborators/collaborator.module';
import { LoggerProvider } from './logger/winstor.logger';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CidModule } from './cid/cid.module';
import { MedicalCertificateModule } from './medical-certificates/medical-certificate.module';

@Module({
  imports: [
    CollaboratorsModule,
    AuthModule,
    CidModule,
    MedicalCertificateModule,
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      ttl: 3600,
      max: 100,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerProvider],
})
export class AppModule {}
