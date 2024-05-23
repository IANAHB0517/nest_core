import { IsNumber } from 'class-validator';
import { MessagesModel } from '../entity/messages.entity';
import { PickType } from '@nestjs/mapped-types';

export class CreateMessagesDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number;

  // socketIO 에서 accessToken을 다루지 못하기 때문에 전단 계에서 임의로 값을 넣어주도록 함
  @IsNumber()
  authorId: number;
}
