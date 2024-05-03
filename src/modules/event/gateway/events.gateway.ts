import {
  ConnectedSocket,
  // MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  // SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
  namespace: /\/ws-.+/,
  pingInterval: 10000,
  pingTimeout: 5000,
  allowEIO3: true,
})
export class EventGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  private logger = new Logger(EventGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.debug(`Socket Server Init Complete`);
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    client.emit('connect-message', `${client.id}`);
    this.logger.debug(`${client.id}가 연결되었습니다`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.debug(`${client.id}가 연결이 끊겼습니다`);
  }
}
