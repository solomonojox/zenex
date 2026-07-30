import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true keeps the raw request buffer so the Stripe webhook can
  // verify signatures (needed only in live mode).
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  const prefix = config.get<string>('apiPrefix', 'api');
  app.setGlobalPrefix(prefix);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('port', 4000);
  await app.listen(port);
  Logger.log(`Zenex API running on http://localhost:${port}/${prefix}`, 'Bootstrap');
}
bootstrap();
