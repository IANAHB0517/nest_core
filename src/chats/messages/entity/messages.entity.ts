import { BaseModel } from 'src/common/entity/base.entity';
import { ChatsModel } from '../../entity/chats.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { IsString } from 'class-validator';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
