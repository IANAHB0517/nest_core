import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PostsService } from './posts.service';

/** author : string;
 * title : string;
 * content : string;
 * likeCount : nmber;
 * commnetCount : nmber;
 */

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commnetCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjenas_offical',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 1000000,
    commnetCount: 99999,
  },
  {
    id: 2,
    author: 'newjenas_offical',
    title: '뉴진스 해리',
    content: '노래 연습 해리',
    likeCount: 1000000,
    commnetCount: 99999,
  },
  {
    id: 3,
    author: 'newjenas_offical',
    title: '뉴진스 굥냐',
    content: '제일 이쁜 굥냐',
    likeCount: 1000000,
    commnetCount: 99999,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) Get /posts
  //    모든 posts를 다 가지고온다
  @Get(':id')
  getPosts(@Param('id') id: String) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
  // 2) GET /posts/:id
  //    id에 해당하는 postsfmf rkwudhsek
  //    예를 들어 id=1일 경우 id가 1인 포스트를 가져온다.
  @Get()
  getPost() {
    return posts;
  }

  // 3) POST /posts
  //    post를 생성한다.

  // 4) PUT /posts/:id
  //    id에 해당하는 POST를 변경한다.

  // 5) DELETE /posts/:id
  //    id에 해당되는 POST를 삭제한다.
}
