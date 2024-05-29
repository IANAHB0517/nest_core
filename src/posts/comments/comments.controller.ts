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
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UpdateCommentDto } from './dto/update-comments.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModel } from 'src/users/entity/users.entity';

// comments의 경우 항상 특정 포스트에 귀속 되기 때문
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
    /**
     * 1) Entity 생성
     * author -> 작성자
     * post -> 귀속되는 포스트
     * comment -> 실제 댓글 내용
     * likeCount -> 좋아요 갯수
     *
     * id -> PrimaryGeneratedColumn
     * createdAt -> 생성일자
     * updatedAt -> 수정일자
     *
     * 2) GET() Pagination
     * 3) GET(':commentId') 특정 Comment만 하나 가져오는 기능
     * 4) POST() 코멘트 생성하는 기능
     * 5) PATCH(':commentId') 특정 Comment 업데이트 하는 기능
     * 6) DELETE(':commentId') 특정 Comment 삭제하는 기능
     */
  }

  @Get()
  GetComments(
    @Query() query: PaginateCommentsDto,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.commentsService.paginateComment(query, postId);
  }

  @Get(':commentId')
  GetSpecificComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getComment(commentId);
  }

  // User 데코레이터와 액세스 토큰 가드는 한 쌍으로 사용된다, 해당 기능을 위해서는 모듈에 UsersModule과 AuthModule을 모두 Import해주어야 한다.
  @Post()
  @UseGuards(AccessTokenGuard)
  async PostComment(
    @User() user: UsersModel,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(user, postId, dto);

    return this.commentsService.getComment(comment.id);
  }

  @Patch(':commentId')
  @UseGuards(AccessTokenGuard)
  PatchComment(
    @User() user: UsersModel,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, user, dto);
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  deleteComment(
    @User('id') authorId: number,
    @Param('commentId', ParseIntPipe) id: number,
  ) {
    return this.commentsService.deleteComment(authorId, id);
  }
}
