import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socker-bearer-token.guard';
import { UsersModel } from 'src/users/entities/users.entity';

// 웹소켓 어노테이션을 붙여주면 게이트 namespace 옵션을 사용해 웨이로서의 라우팅을 지정해줄 수 있다
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
  ) {}

  // nestJS frame work가 넣어주는 생성된 웹소켓 서버 이때의 Server는 socketIO의 서버를 가지고 와야한다
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connet called : ${socket.id}`);
    // throw new Error('Method not implemented.');
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
  @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    // nestJS에서 생성된 소켓을 주입해준다. /// 어떤 소캣을 주입해주는가??????
    @ConnectedSocket() socket: Socket,
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
  @UseGuards(SocketBearerTokenGuard)
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
  @UseGuards(SocketBearerTokenGuard)
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
