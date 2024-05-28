import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roels.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.messge';
import { Exclude } from 'class-transformer';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { MessagesModel } from 'src/chats/messages/entity/messages.entity';

/**
 *
 */

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    // 1) 길이가 20을 넘지 않을 것
    length: 20,
    // 2) 유일무이한 값이 될 것
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, { message: lengthValidationMessage })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  /**
   * 존재하지 않는 컬럼을 생성하여 노출 시킬 수 있다
   */
  // @Expose()
  // get nicknameAndEmail() {
  //   return this.nickname + '/' + this.email;
  // }

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(3, 8, { message: lengthValidationMessage })
  /**
   * Request
   * frontend -> backend
   * plain object (JSON) -> class instance (dto)
   *
   * Response
   * backend -> frontend
   * class instance (dto) - > plain object (JSON)
   *
   * toClassOnly -> class instance로 변활될 때만
   * toPlainOnly -> plain object로 변환될 때만
   */
  @Exclude({
    // Response 에서 만 삭제
    toPlainOnly: true,
    // Request 에서 만 삭제
    // toClassOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  // n : n 관계의 경우 각각의 테이블과 중간 테이블까지 세개의 테이블을 사용하여 데이터를 연동해준다
  // 그 과정을 위해 한쪽에는 JoinTable 어노테이션이 필요하다.
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;
}
