import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entity/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';
import { CreateMessagesDto } from './dto/create-message.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async createMessage(dto: CreateMessagesDto, authorId: number) {
    const message = await this.messagesRepository.save({
      // 1 : 1 의 관계일 경우는 이렇게 값을 넣어줄 수있다.
      chat: {
        id: dto.chatId,
      },
      author: {
        id: authorId,
      },
      message: dto.message,
    });

    return this.messagesRepository.findOne({
      where: {
        id: message.id,
      },
      relations: {
        chat: true,
      },
    });
  }

  paginateMessages(
    dto: BasePaginationDto,
    overrideFindOptions: FindManyOptions<MessagesModel>,
  ) {
    return this.commonService.paginate(
      dto,
      this.messagesRepository,
      overrideFindOptions,
      'messages',
    );
  }
}
