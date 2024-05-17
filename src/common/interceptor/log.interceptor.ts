import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, observable, map } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const now = new Date();
    /**
     *  요청이 들어올 때 REQ 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날때 (응답이 나갈때) 다시 스탬프를 찍는다.
     * [RES] {요청 path} {응답 시간} {소요 시간 ms}
     */

    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    // [REQ] {요청 path} {요청 시간}
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    return (
      next
        // return next.handle()을 실행하는 순간
        // 라우트의 로직이 전부 실행되고 obvervable롤 응답이 반한된다.
        .handle()
        // // rxjs에 있는 원하는 모든 기능을 실행할 수 있다.
        // // 같은 기능을 여러번 실행할 수 있다.
        // .pipe(
        //   // 값을 전달 받아 해당 값을 모니터링 할 수 있게 해준다. 변형 불가
        //   tap((observable) => console.log(observable)),
        //   // 응답에 원하는 키를 추가 하는 등 값을 변경 할 수 있다.
        //   map((observable) => {
        //     return {
        //       message: '응답이 변경 되었습니다,',
        //       response: observable,
        //     };
        //   }),
        //   // 다시 tap 메소드를 실행할 경우 map을 통해 변경된 값을 모니터링 할 수 있다.
        //   tap((observable) => console.log(observable)),
        // )
        .pipe(
          tap(
            // [RES] {요청 path} {응답 시간} {소요 시간 ms}
            (observable) =>
              console.log(
                `[RES] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()} ms`,
              ),
          ),
        )
    );
  }
}
