import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { promises } from 'fs';
import { basename, join } from 'path';

/** author : string;
 * title : string;
 * content : string;
 * likeCount : nmber;
 * commentCount : nmber;
 */

// export interface PostsModel {
//   id: number;
//   author: string;
//   title: string;
//   content: string;
//   likeCount: number;
//   commentCount: number;
// }

// const posts: PostsModel[] = [
//   {
//     id: 1,
//     author: 'newjenas_offical',
//     title: '뉴진스 민지',
//     content: '메이크업 고치고 있는 민지',
//     likeCount: 1000000,
//     commentCount: 99999,
//   },
//   {
//     id: 2,
//     author: 'newjenas_offical',
//     title: '뉴진스 해리',
//     content: '노래 연습 해리',
//     likeCount: 1000000,
//     commentCount: 99999,
//   },
//   {
//     id: 3,
//     author: 'newjenas_offical',
//     title: '뉴진스 굥냐',
//     content: '제일 이쁜 굥냐',
//     likeCount: 1000000,
//     commentCount: 99999,
//   },
// ];

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find({
      // author 이라는 값을 통해 가지고오기 때문에 중복된 값을 가져오지 않고 한번 가지고 온 값을 재활용하여 출력해주기 때문에 메모리와 속도를 절약할 수 있다.
      relations: ['author'],
    });
  }

  // 오름차순으로 정렬하는 pagination만 구현한다
  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        /**
         * join 되어 가지고 와야 하는 값이나 필터링 되어야 하는 값을 넣어준다
         *  */
        relations: ['author'],
      },
      'posts',
    );
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    /**
     * data : Data[],
     * total: number,
     
     * 
     * [1] [2] [3] [4]
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    /**
     * {
     *  id : LessThan(dto.where__id_less_than);
     * }
     */
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }
    const posts = await this.postsRepository.find({
      where,
      // order__createdAt
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 null을 반환한다.
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);
    if (nextUrl) {
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 벨류가 존재하면
       * param에 그대로 붙여넣는다
       *
       * 단, where__id__more_than 값만  lastItem의 마지막 값으로 넣어준다.
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    /**
     * Response
     *
     * data : Data[],
     * cursor : {
     *  atfer : 마지막 Data의 ID
     *  },
     * count: 응답한 데이터의 갯수
     * next : 다음 요청을 할 때 사용할 URL
     *
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 컨텐츠 ${i}`,
      });
    }
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    //1) create -> 저장할 객체를 생성한다.
    //2) save -> 객체를 저장한다.(create 메서드에서 생성한 객체로)

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async createPostImage(dto: CreatePostDto) {
    // dto의 이미지 이름을 기반으로
    // 파일의 경로를 생성한다
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.image);

    try {
      // 파일이 존재하는지 확인
      // 파일이 존재하지 않으면 에러를 던짐
      promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    // 파일의 이름을 불러옴
    // /user/aaa/bbb/ccc/asdf.jpg => asdf.jpg
    const fileName = basename(tempFilePath);

    // 새로이동할 포스트 폴더의 경로 + 이미지 이름
    // {프로젝트경로}/public/posts/asdf.jpg
    const newPath = join(POST_IMAGE_PATH, fileName);

    // 첫번째 경로에서 두변째 경로로 해당 파일을 이동시킨다.
    // Linux의 mv 명령어와 같은 방법으로 사용
    await promises.rename(tempFilePath, newPath);

    return true;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    //delete의 사용법
    // 1) 해당 로우가 있는지 확인한다
    // 2) delete 메소드의 파라미터는 pk값을 사용한다.
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }
}
