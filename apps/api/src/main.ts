import 'dotenv/config';
import { FASE_ACTUAL, etiquetaVersion } from '@electricos/shared';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ENV } from './config/config.module';
import type { Env } from './config/env';
import { VERSION_API } from './version';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = app.get<Env>(ENV);

  app.setGlobalPrefix('api');
  // Swagger UI necesita scripts en línea: CSP relajada solo en /api/docs
  const helmetApi = helmet();
  const helmetDocs = helmet({ contentSecurityPolicy: false });
  app.use((req: Request, res: Response, next: NextFunction) => (req.path.startsWith('/api/docs') ? helmetDocs : helmetApi)(req, res, next));
  app.enableCors({ origin: env.WEB_URL, credentials: true });
  app.enableShutdownHooks();

  const swagger = new DocumentBuilder()
    .setTitle('Plataforma Eléctricos SEC — API')
    .setDescription(`API REST de la plataforma para instaladores eléctricos autorizados por la SEC. ${etiquetaVersion(VERSION_API)} (${FASE_ACTUAL.nombre}).`)
    .setVersion(VERSION_API)
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, swagger));

  await app.listen(env.PORT);
  Logger.log(`API ${etiquetaVersion(VERSION_API)} escuchando en http://localhost:${env.PORT}/api · Swagger: /api/docs`, 'Bootstrap');
}

bootstrap();
