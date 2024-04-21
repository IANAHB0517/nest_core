import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';

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
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(author: string, title: string, content: string) {
    //1) create -> 저장할 객체를 생성한다.
    //2) save -> 객체를 저장한다.(create 메서드에서 생성한 객체로)

    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(
    postId: number,
    author: string,
    title: string,
    content: string,
  ) {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
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
