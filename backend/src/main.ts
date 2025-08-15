import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { AuthService } from './auth/application/auth.service';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Med-Cert API')
    .setDescription('API para gerenciamento de certificados médicos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('collaborators', 'Endpoints de colaboradores')
    .addTag('medical-certificates', 'Endpoints de certificados médicos')
    .addTag('cid', 'Endpoints de CID')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

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

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Aplicação rodando na porta ${port}`);
  logger.log(
    `📚 Documentação Swagger disponível em: http://localhost:${port}/docs`,
  );
}

void bootstrap();
