import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { AuthService } from './auth/application/auth.service';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Aplicação rodando na porta ${port}`);
  logger.log(
    `📚 Documentação Swagger disponível em: http://localhost:${port}/docs`,
  );
}

void bootstrap();
