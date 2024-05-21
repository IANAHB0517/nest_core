import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

// 웹소켓 어노테이션을 붙여주면 게이트 namespace 옵션을 사용해 웨이로서의 라우팅을 지정해줄 수 있다
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  handleConnection(socket: Socket) {
    console.log(`on connet called : ${socket.id}`);
    // throw new Error('Method not implemented.');
  }

  // socket.on('send_message, (message) => {console.log(message)}); --> 어노테이션을 사용해 구현하면 아래와 같다
  // 이벤트를 리스닝 한다는 어노테이션([리스닝할 이벤트])
  @SubscribeMessage('send_message')
  // 메소드의 이름 ([매개변수명:받으려는 데이터의 형식])
  sendMessage(@MessageBody() message: string) {
    console.log(message);
  }
}
