import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { TEMP_FOLDER_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, callback) => {
        /**
         * callback (에러, boolean)
         *
         * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
         * 두번쨰 파라미터에는 파일을 받을지 말지 boolean을 넣어준다.2
         *
         */
        //xxx.jpg -> .jpg 확장자만 분리해줌
        // 이를 통해서 특정 확장자만 받도록 보안처리를 해줌
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callback(
            new BadRequestException('jpg, jpeg, png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, callback) {
          callback(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
