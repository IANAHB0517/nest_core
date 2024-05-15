import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // dto에 특정 값을 입력하지 않을시 선언되어있는 defualt 값들이 들어갈 수 있도록 허가해주는 코드
      transform: true,
      transformOptions: {
        // 쿼리스트링으로 들어옵 값을 클래스 트렌스포머를 통해 어노테이션에 지정되어 있는 대로 임의로 변환 하는 것을 허용 하는 옵션
        enableImplicitConversion: true,
      },
      // 쿼리를 통해 들어오는 key 값을 dto로 설정해놓은 값만 허용하도록 한다.
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
