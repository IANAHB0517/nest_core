import { IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

// 하나의 엔티티를 새로 만들게 되면 해당 모듈의 tyoeORM에 forFeature를 등록하고 앱 모듈에도 해당 모델을 등록해서 repository를 사용할 수 있도록 해줘야한다.
@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.postComments, { nullable: false })
  author: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.comments, { nullable: false })
  post: PostsModel;

  @Column()
  @IsString()
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
