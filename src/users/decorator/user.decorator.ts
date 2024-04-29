import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const user = req.user;

  if (!user) {
    throw new InternalServerErrorException(
      'User 데코레이터는 AccessTokenGuard와 함께 사용해야 합니다.',
    );
  }

  return user;
});
