import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AppConfig } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  const config = new DocumentBuilder()
    .setTitle('OKTEN-SCHOOL-CRM')
    .setDescription(
      'OKTEN-SCHOOL-CRM - a scalable and flexible platform similar to CRM, integrated with AWS.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 7,
      persistAuthorization: true,
    },
  });

  // Увімкнення CORS
  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Глобальні Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        Logger.error('Validation failed', JSON.stringify(validationErrors));
        return new BadRequestException(
          validationErrors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        );
      },
    }),
  );

  await app.listen(appConfig.port, () => {
    Logger.log(`Server running on http://${appConfig.host}:${appConfig.port}`);
    Logger.log(
      `Swagger running on http://${appConfig.host}:${appConfig.port}/docs`,
    );
  });
}

void bootstrap();
