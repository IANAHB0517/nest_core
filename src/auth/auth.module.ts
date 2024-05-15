import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigService } from '@nestjs/config';
import { ENV_JWT_SECRET_KEY } from 'src/common/const/env-keys.const';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ENV_JWT_SECRET_KEY),
        signOptions: { expiresIn: '3d' },
      }),
    }),
    UsersModule,
  ],
  exports: [AuthService, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
