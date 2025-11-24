import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// ⚠️ IMPORTANTE: dotenv.config() debe ejecutarse ANTES de crear la aplicación
// para que las variables de entorno estén disponibles cuando se ejecuten los hooks de ciclo de vida
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
