import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decoretor';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * Roles anootation에 대한 matadata를 가져와야한다.
     *
     * reflector nestJS IOC container에서 자동으로 주입받는다
     * getAllAndOverride() Roles anonotation을 만들 때 넣어준 키에 해당하는 정보를 모두 가져온다.
     * 현재 실해중인 method에서 단계적으로 가장 가까운 어노테이션을 가져온다.
     */

    // 아래의 로직으로 가드가 적용된 context내에서 Roles_KEY라는 키 값을 기준으로 metadata를 가져 올 수 있다.
    const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Roles Annotation이 등록 되어 있지 않음 -> 실행중인 메서드에 따라서 가드의 로직을 사용할 것인지 아닌지 결정하는 부분 가드를 앱 전체에 등록 해놓고 특정 메서드에서만 검사 이후의 로직을 실행하도록 한다.
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException(` 토큰을 제공 해주세요!`);
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        ` 이 작업을 수행할 권한이 없습니다. ${requiredRole} 권한이 필요합니다.`,
      );
    }

    return true;
  }
}
