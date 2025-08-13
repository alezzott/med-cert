import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollaboratorController } from './infra/collaborator.controller';
import { CollaboratorService } from './application/collaborator.service';
import { CollaboratorUseCase } from './application/collaborator.use-case';
import { CollaboratorRepositoryImpl } from './infra/collaborator.repository.impl';
import { CollaboratorSchema } from './infra/collaborator.schema';
import { LoggerProvider } from '../logger/winstor.logger';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Collaborator', schema: CollaboratorSchema },
    ]),
  ],
  controllers: [CollaboratorController],
  providers: [
    LoggerProvider,
    CollaboratorService,
    CollaboratorUseCase,
    {
      provide: 'CollaboratorRepository',
      useClass: CollaboratorRepositoryImpl,
    },
  ],
  exports: [CollaboratorService, CollaboratorUseCase],
})
export class CollaboratorsModule {}
