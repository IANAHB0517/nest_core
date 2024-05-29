import { PartialType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UsersModel } from 'src/users/entity/users.entity';

export class UpdateCommentDto extends PartialType(CommentsModel) {
  @IsString()
  @IsOptional()
  comment: string;

  @IsNumber()
  // 옵셔널을 주지 않는 것만으로 넘버릭 오류가 발생했다 왜 인가??
  @IsOptional()
  author: UsersModel;
}
