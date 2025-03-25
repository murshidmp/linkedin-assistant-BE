import * as nodeCrypto from 'crypto';

// If there's no global crypto, define it for Nest's schedule usage
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {
    randomUUID: nodeCrypto.randomUUID,
  };
}

// Early in main.ts or app.module
console.log('DB_HOST is:', process.env.DB_HOST);
console.log('DB_PORT is:', process.env.DB_PORT);
console.log('DB_USER is:', process.env.DB_USER);
console.log('DB_PASS is:', process.env.DB_PASS);
console.log('DB_NAME is:', process.env.DB_NAME);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LinkedIn Assistant API')
      .setDescription('API documentation for the LinkedIn Assistant service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/api', app, document);
  }


  await app.listen(3010);
}
bootstrap();
