import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { AuthService } from './auth/application/auth.service';
import { LoggerService } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  const userService = app.get(AuthService);
  const logger = app.get<LoggerService>('Logger');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const adminExists = await userService.findByEmail(adminEmail);
    if (!adminExists) {
      await userService.createAdmin({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
      });
      logger.log('Admin criado automaticamente');
    }
  }

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}

void bootstrap();
