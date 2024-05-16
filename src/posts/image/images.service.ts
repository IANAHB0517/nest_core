import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from 'src/common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // dto의 이미지 이름을 기반으로
    // 파일의 경로를 생성한다
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

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

    // save
    const result = await repository.save({
      ...dto,
    });

    // 첫번째 경로에서 두변째 경로로 해당 파일을 이동시킨다.
    // Linux의 mv 명령어와 같은 방법으로 사용
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
