import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from '../../dist/chats/chats.gateway';

@Module({
  controllers: [ChatsController],
  // 게이트 웨이는 프로바이터에 등록한다.
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
