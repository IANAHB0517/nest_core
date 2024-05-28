import { PartialType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UsersModel } from 'src/users/entity/users.entity';

export class UpdateCommentDto extends PartialType(CommentsModel) {
  @IsString()
  @IsOptional()
  comment: string;

  @IsNumber()
  author: UsersModel;
}
