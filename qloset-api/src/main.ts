import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
/*
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
app.enableCors({ origin: true, credentials: true });
await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
*/

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // or lock to your domains later
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
