import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ImageModel } from 'src/common/entity/image.entity';
import { CommentsModel } from '../comments/entity/comments.entity';

@Entity()
export class PostsModel extends BaseModel {
  // 1) UsersModel과 연동한다.
  // Foreign Key를 이용한다.
  // 2) null이 될 수 없다.
  //
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;
  @Column()
  @IsString({ message: stringValidationMessage })
  title: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  content: string;

  @Column()
  likeCount: number;
  @Column()
  commentCount: number;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images: ImageModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.id)
  comments: CommentsModel[];
}
