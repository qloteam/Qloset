import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Allow the admin UI to call the API in dev
  app.enableCors({
  origin: [
    'http://localhost:3000',       // local admin while testing
    // add your hosted admin domain when you have one, e.g.:
    // 'https://admin.yourdomain.com',
  ],
  methods: ['GET','HEAD','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
});


  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = Number(process.env.PORT) || 3001; // run API on 3001
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
