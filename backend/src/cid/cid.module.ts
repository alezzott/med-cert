import { Module } from '@nestjs/common';
import { OmsService } from './application/oms.service';
import { OmsClient } from './infra/oms.client';
import { CidController } from './infra/oms.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerProvider } from '../logger/winstor.logger';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  providers: [OmsService, OmsClient, LoggerProvider],
  controllers: [CidController],
  exports: [OmsService],
  imports: [
    CacheModule.register(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class CidModule {}
