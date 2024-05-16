import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';
import { IsOptional, IsString } from 'class-validator';

// Pick, Omit, partial
// partial : 전부다 optinal로 만들어줌
// PickType, OmitType, PartialType
// 타입이 아닌 값으로 반환을 받기 때문에 extends 받을 수 있다.
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    // 들어오는 값이 list 로 들어오고 리스트의 요소를 모두 검사한다.
    each: true,
  })
  @IsOptional()
  images?: string[] = [];
}
