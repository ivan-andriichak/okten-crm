import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';
import { AppConfig } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  Sentry.init({
    dsn: configService.get<string>('SENTRY_DSN'),
    environment: configService.get<string>('SENTRY_ENV'),
    debug: configService.get<string>('SENTRY_DEBUG') === 'true',
    release: 'okten-crm',
    tracesSampleRate: 1.0,
  });

  const appConfig = configService.get<AppConfig>('app');

  const config = new DocumentBuilder()
    .setTitle('OKTEN-SCHOOL-CRM')
    .setDescription('OKTEN-SCHOOL-CRM - a scalable and flexible platform similar to CRM.')
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

  app.use(
    '/swagger-json',
    (req: any, res: { setHeader: (arg0: string, arg1: string) => void; send: (arg0: OpenAPIObject) => void }) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    },
  );

  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

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
    Logger.log(`Swagger running on http://${appConfig.host}:${appConfig.port}/docs`);
  });
}

void bootstrap();
