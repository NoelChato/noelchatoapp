import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // allow frontend requests
  app.enableCors();

  await app.listen(3000);

  console.log("Server running at http://localhost:3000");
}

bootstrap();
