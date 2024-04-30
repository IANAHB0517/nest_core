import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // dto에 특정 값을 입력하지 않을시 선언되어있는 defualt 값들이 들어갈 수 있도록 허가해주는 코드
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
