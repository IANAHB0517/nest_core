import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) Get /posts
  //    모든 posts를 다 가지고온다
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }
  // 2) GET /posts/:id
  //    id에 해당하는 postsfmf rkwudhsek
  //    예를 들어 id=1일 경우 id가 1인 포스트를 가져온다.

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  //    post를 생성한다.
  // Data Transfer Object
  @Post()
  @UseGuards(AccessTokenGuard)
  // FileInterceptor를 사용하면 posts.module에서 등록해 놓은 multerModule의 단계를 전부 거친 파일만 받을 수 있다.
  // @UseInterceptors(FileInterceptor('image'))
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    // @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.postsService.createPostImage(body);

    return this.postsService.createPost(userId, body);
  }

  // 4) put /posts/:id
  //    id에 해당하는 put를 변경한다.

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, body);
  }

  // 5) DELETE /posts/:id
  //    id에 해당되는 POST를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(+id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User('id') userId: number) {
    await this.postsService.generatePosts(userId);

    return true;
  }
}
