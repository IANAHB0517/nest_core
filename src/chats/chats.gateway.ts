import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { EnterChatDto } from './dto/enter.chat.dto';
import { ChatsService } from './chats.service';
import { CreateMessagesDto } from './messages/dto/create-message.dto';
import { ChatsMessagesService } from './messages/messages.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

// 웹소켓 어노테이션을 붙여주면 게이트 namespace 옵션을 사용해 웨이로서의 라우팅을 지정해줄 수 있다
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(socket: Socket) {
    console.log(`on disconnect call by : ${socket.id}`);
  }

  // 여기서 받는 server는 WebSocketServer 에서 받는 서버와 동일한 서버이다.
  afterInit(server: any) {
    console.log(`after gateway init`);
  }

  // nestJS frame work가 넣어주는 생성된 웹소켓 서버 이때의 Server는 socketIO의 서버를 가지고 와야한다
  @WebSocketServer()
  server: Server;

  // 연결을 관리해주는 함수에서 소켓에 유저를 넣어줄 경우 최초연결실에 입력된 유저의 데이터가 지속되며 해당 로직을 통해 타 메서드에서 토큰 가드를 사용하지 않아도 된다.
  // 1. 연결된 유저정보가 유지된다.
  // 2. 소캣에서 유저정보를 학보하고 있기 때문에 유저 정보를 신뢰할 수 있다.
  // 3. 이를 통해 매번의 요청마다 토큰을 확인할 필요가 없어진다.
  // 4. socket을 통해 존속되어야 하는 정보가 있다면 유저정보를 전달하는 방법으로 계속해서 전달할 수 있다.
  async handleConnection(socket: Socket & { user: UsersModel }) {
    const headers = socket.handshake.headers;

    // Bearer xxxx.xxx.x
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);

      // 소캣에 특정 갑을 넣어줄 때는 아래와 같이 단순히 socket.property로 한다.
      socket.user = user;

      return true;
    } catch (e) {
      // socket의 연결을 끊는다.
      // socket을 끊으면서 에러메세지를 던질 수는 없는가??
      socket.disconnect();
    }
  }

  // socketIO 에서는 subscribe 별로 파이프를 별도 적용을 해주어야 한다!
  @UsePipes(
    new ValidationPipe({
      // dto에 특정 값을 입력하지 않을시 선언되어있는 defualt 값들이 들어갈 수 있도록 허가해주는 코드
      transform: true,
      transformOptions: {
        // 쿼리스트링으로 들어옵 값을 클래스 트렌스포머를 통해 어노테이션에 지정되어 있는 대로 임의로 변환 하는 것을 허용 하는 옵션
        enableImplicitConversion: true,
      },
      // 쿼리를 통해 들어오는 key 값을 dto로 설정해놓은 값만 허용하도록 한다.
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    // nestJS에서 생성된 소켓을 주입해준다. /// 어떤 소캣을 주입해주는가??????
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId :  ${chatId}`,
        });
      }
    }

    // 기존에는 loop을 돌리는 형식이었지만 map 함수를 사용하면 굳이 loop을 돌릴 필요가 없다.
    socket.join(data.chatIds.map((x) => x.toString()));
  }

  // socketIO 에서는 subscribe 별로 파이프를 별도 적용을 해주어야 한다!
  @UsePipes(
    new ValidationPipe({
      // dto에 특정 값을 입력하지 않을시 선언되어있는 defualt 값들이 들어갈 수 있도록 허가해주는 코드
      transform: true,
      transformOptions: {
        // 쿼리스트링으로 들어옵 값을 클래스 트렌스포머를 통해 어노테이션에 지정되어 있는 대로 임의로 변환 하는 것을 허용 하는 옵션
        enableImplicitConversion: true,
      },
      // 쿼리를 통해 들어오는 key 값을 dto로 설정해놓은 값만 허용하도록 한다.
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // RestAPI로 채팅방을 만드는 것이 더 효율적이고 시멘틱하다
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      // dto에 특정 값을 입력하지 않을시 선언되어있는 defualt 값들이 들어갈 수 있도록 허가해주는 코드
      transform: true,
      transformOptions: {
        // 쿼리스트링으로 들어옵 값을 클래스 트렌스포머를 통해 어노테이션에 지정되어 있는 대로 임의로 변환 하는 것을 허용 하는 옵션
        enableImplicitConversion: true,
      },
      // 쿼리를 통해 들어오는 key 값을 dto로 설정해놓은 값만 허용하도록 한다.
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // socket.on('send_message, (message) => {console.log(message)}); --> 어노테이션을 사용해 구현하면 아래와 같다
  // 이벤트를 리스닝 한다는 어노테이션([리스닝할 이벤트])
  @SubscribeMessage('send_message')
  // 메소드의 이름 ([매개변수명:받으려는 데이터의 형식])
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방 입니다. Chat ID : ${dto.chatId}`,
      );
    }

    const message = await this.messageService.createMessage(
      dto,
      socket.user.id,
    );

    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
