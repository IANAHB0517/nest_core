import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { CommonModule } from 'src/common/common.module';
import { ChatsGateway } from './chats.gateway';
import { ChatsMessagesService } from './messages/messages.service';
import { MessagesModel } from './messages/entity/messages.entity';
import { MessagesController } from './messages/messages.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel]),
    CommonModule,
  ],
  controllers: [ChatsController, MessagesController],
  // 게이트 웨이는 프로바이터에 등록한다.
  providers: [ChatsGateway, ChatsService, ChatsMessagesService],
})
export class ChatsModule {}
