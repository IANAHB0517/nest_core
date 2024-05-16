import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entity/image.entity';
import { PostsImagesService } from './image/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    AuthModule,
    CommonModule,
  ],

  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
