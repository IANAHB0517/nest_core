import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])],

  controllers: [UsersController],
  // providers 해당 모듈 내에서만 사용 가능한 클래스.
  providers: [UsersService],
  // 다른 모듈에 import되었을 때 사용 가능 하도록 하려면 exports에 클래스를 선언해주어야 한다.
  exports: [UsersService],
})
export class UsersModule {}
