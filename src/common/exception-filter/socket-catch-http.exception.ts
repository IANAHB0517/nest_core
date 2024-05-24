import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    socket.emit('exception', {
      // 추가적인 정보를 넣어 줄 수 있다.

      // 현재는 예외처리의 응답 내용을 전달해주는 형태
      data: exception.getResponse(),
    });
  }
}
