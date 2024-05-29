import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginateCommentsDto } from './dto/paginate-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comments.dto';
import { Repository } from 'typeorm';
import { CommentsModel } from './entity/comments.entity';
import { CommonService } from '../../common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from 'src/users/entity/users.entity';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comments.find-options.const';

@Injectable()
export class CommentsService {
  constructor(
    // 어노테이션을 잊지말자
    @InjectRepository(CommentsModel)
    private readonly commentRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  async deleteComment(authorId: number, id: number) {
    const comment = await this.checkAuthor(authorId, id);

    if (!comment) {
      throw new NotFoundException();
    }

    await this.commentRepository.delete(comment.id);

    return id;
  }

  async createComment(
    author: UsersModel,
    postId: number,
    commentDto: CreateCommentDto,
  ) {
    return this.commentRepository.save({
      author,
      post: {
        id: postId,
      },
      ...commentDto,
    });

    // 다른 로직을 처리하려는게 아니라면 아래의 과정 없이 바로 세이브하는 것이 더 빠르다
    // const comment = this.commentRepository.create({
    //   author,
    //   post: {
    //     id: postId,
    //   },
    //   ...commentDto,
    // });
  }

  // return this.commentRepository.save(comment);

  async getComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });

    if (!comment) {
      throw new NotFoundException(`존재하지 않는 댓글입니다.`);
    }

    return comment;
  }

  async updateComment(
    commentId: number,
    user: UsersModel,
    dto: UpdateCommentDto,
  ) {
    const prevComment = await this.commentRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentRepository.save(prevComment);

    return newComment;

    // const comment = await this.checkAuthor(user.id, commentId);
    // if (!comment) {
    //   throw new NotFoundException(`존재하지 않는 댓글입니다.`);
    // }
    // if (dto.comment) {
    //   comment.comment = dto.comment;
    // }
    // const newComment = await this.commentRepository.save(comment);
    // return newComment;
  }

  paginateComment(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentRepository,
      {
        where: { post: { id: postId } },
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `posts/${postId}/comments`,
    );
  }

  // 입력받은 authorId와 commentId로 해당 댓글이 존재하는지와 작성자가 아니라면 삭제 및 수정을 하지 못하도록 하는 메서드
  async checkAuthor(authorId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: {
        author: true,
      },
    });

    if (authorId !== comment.author.id) {
      throw new BadRequestException(
        '자신이 작성하지 않은 댓글은 수정,삭제 할 수 없습니다.',
      );
    }

    return comment;
  }
}
