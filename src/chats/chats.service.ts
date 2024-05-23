import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from '../common/common.service';
import { PaginateChatDto } from './dto/paginate-chat';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatRepository,
      { relations: { users: true } },
      'chats',
    );
  }

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatRepository.save({
      // 1, 2, 3
      // {id:1}, {id:2}, {id:3}
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatRepository.find({
      where: {
        id: chat.id,
      },
    });
  }

  async checkIfChatExists(chatId: number) {
    const exists = await this.chatRepository.exists({
      where: { id: chatId },
    });

    return exists;
  }
}
