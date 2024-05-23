import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddleware } from './common/middleware/log.middleware';
import { ChatsModule } from './chats/chats.module';
import { ChatsModel } from './chats/entity/chats.entity';
import { MessagesModel } from './chats/messages/entity/messages.entity';

@Module({
  imports: [
    PostsModule,
    ServeStaticModule.forRoot({
      // 2b2d.png
      // serveRoot를 넣어주면 이렇게 가지고 올 수 있다. http://localhost:3000/public.posts/2b2d.png
      // rootPath로 PUBLIC_FOLDER_PATH 만 넣어주면 이렇게 가져오면서 다른 endPoint와 주소가 겹치게 된다. http://localhost:3000/posts/2b2d.png
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      // 환경번수 파일명
      envFilePath: '.env',
      // 해당 모듈을 사용하기 위해서 각 서비스나 프로바이더에 임포트 하지않고 전역적으로 사용할 수 있도록 하는 설정
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // 데이터베이스 타입
      type: 'postgres',
      // 현재 파일에서는 위에 ConfigModule을 인젝션해준 상태이기 때문에 configService를 할당해서 사용하기 어렵다 이를 대체 하기 위해 process.env[] 를 사용한다
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      // 사용할 모든 모델을 넣어준다.
      entities: [PostsModel, UsersModel, ImageModel, ChatsModel, MessagesModel],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
