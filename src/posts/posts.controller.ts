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
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { RolesEnum } from 'src/users/const/roels.const';
import { Roles } from 'src/users/decorator/roles.decoretor';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) Get /posts
  //    모든 posts를 다 가지고온다
  @Get()
  @UseInterceptors(LogInterceptor)
  // IsPublic 어노테이션을 이용해서 특정 API를 로그인 없이 사용할 수 있도록 해준다.
  @IsPublic()
  getPosts(@Query() query: PaginatePostDto) {
    // throw new BadRequestException('에러테스트');

    return this.postsService.paginatePosts(query);
  }
  // 2) GET /posts/:id
  //    id에 해당하는 postsfmf rkwudhsek
  //    예를 들어 id=1일 경우 id가 1인 포스트를 가져온다.

  @Get(':id')
  @IsPublic()
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  //    post를 생성한다.
  // Data Transfer Object

  /**
   * A Model, B Model
   *
   * Post API -> A 모델을 저장하고, B 모델을 저장한다.
   * await repository.save(a);
   * await repository.save(b);
   *
   * 만약에 a를 저장하다가 실패하면 b를 저장하면 안될 경우
   *
   * All or Nothing
   *
   * transaction
   * start -> 시작
   * commit -> 저장
   *
   * rollback -> 원상복구
   * */

  @Post()
  @UseGuards(AccessTokenGuard)
  // transaction은 인터셉터에게 맡기고 컨트롤러에서는 로직의 흐름에 따라 서비스 메소드의 호출만을 신경 쓸수 있는 구조로 만들어준다.
  @UseInterceptors(TransactionInterceptor)
  // FileInterceptor를 사용하면 posts.module에서 등록해 놓은 multerModule의 단계를 전부 거친 파일만 받을 수 있다.
  // @UseInterceptors(FileInterceptor('image'))
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    // @UploadedFile() file?: Express.Multer.File,
    @QueryRunner() qr: QR,
  ) {
    // 로직 실행
    const post = await this.postsService.createPost(userId, body, qr);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }
    return this.postsService.getPostById(post.id, qr);
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
  @UseGuards(AccessTokenGuard) // 토큰 가드를 활용하여 헤더에 사용자 정보를 넣어주구 이후 RolesEnum을 활용하여 권한을 확인하도록 한다.
  @Roles(RolesEnum.ADMIN)
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
// RBAC - Role Based Access Control
