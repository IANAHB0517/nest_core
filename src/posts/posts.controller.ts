import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

/** author : string;
 * title : string;
 * content : string;
 * likeCount : nmber;
 * commnetCount : nmber;
 */

interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commnetCount: number;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPost(): Post {
    return {
      author: 'newjeans_official',
      title: '뉴진스 민지',
      content: '메이크업 고치고 있는 민지',
      likeCount: 1000000,
      commnetCount: 9999999,
    };
  }
}
