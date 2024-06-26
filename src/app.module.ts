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
import { PostsModel } from './posts/entity/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entity/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { CommentsModule } from './posts/comments/comments.module';
import { CommentsModel } from './posts/comments/entity/comments.entity';
import { RolesGuard } from './users/guard/roles.guard';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';

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
      entities: [
        PostsModel,
        UsersModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // app_module에 액세스토큰 가드를 넣어줌으로 인해서 모든 요청이 accessTokenGuard가 적용되어 버린다.
    // 모든 API가 token을 필요로 하게 된다.
    // 이 방법이 더 일반적인 설계다.
    // 이에 대한 대처로 특정 API에 PUblicAPI라는 토큰을 달아준다.
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    // 가드는 배치의 순서가 중요하다 어떤 가드를 언제 실행하는지 잘 확인하자
    { provide: APP_GUARD, useClass: RolesGuard },
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
