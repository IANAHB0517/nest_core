import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatrepository: Repository<ChatsModel>,
  ) {}

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatrepository.save({
      // 1, 2, 3
      // {id:1}, {id:2}, {id:3}
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatrepository.find({
      where: {
        id: chat.id,
      },
    });
  }
}
