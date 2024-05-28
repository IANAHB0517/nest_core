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
    authorId: number,
    postId: number,
    commentDto: CreateCommentDto,
  ) {
    const comment = this.commentRepository.create({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...commentDto,
    });

    return this.commentRepository.save(comment);
  }
  async getComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`존재하지 않는 댓글입니다.`);
    }

    return comment;
  }

  async updateComment(
    commentId: number,
    authorId: number,
    dto: UpdateCommentDto,
  ) {
    console.log('check1');

    const comment = await this.checkAuthor(authorId, commentId);

    if (!comment) {
      throw new NotFoundException(`존재하지 않는 댓글입니다.`);
    }

    console.log(comment);

    if (dto.comment) {
      comment.comment = dto.comment;
    }

    console.log(comment);

    const newComment = await this.commentRepository.save(comment);

    return newComment;
  }

  paginateComment(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentRepository,
      {
        relations: {
          author: true,
        },
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
