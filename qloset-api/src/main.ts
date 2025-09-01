import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { PrismaService } from './prisma.service';
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
  app.enableCors({
    origin:  [
    'http://localhost:5174', // admin (vite default)
    'http://localhost:5175', // courier (vite alt)
  ], // or specify your web origins array
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

  }); // or lock to your domains later
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
