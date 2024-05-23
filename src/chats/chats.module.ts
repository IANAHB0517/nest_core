import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { CommonModule } from 'src/common/common.module';
import { ChatsGateway } from './chats.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatsModel]), CommonModule],
  controllers: [ChatsController],
  // 게이트 웨이는 프로바이터에 등록한다.
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
