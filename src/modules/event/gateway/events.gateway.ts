import {
  ConnectedSocket,
  // MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Tensor3D } from '@tensorflow/tfjs';

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

  @SubscribeMessage('image')
  async onImage(
    @ConnectedSocket() client: Socket,
    message: { data: Buffer },
  ): Promise<void> {
    try {
      const image = tf.node.decodeImage(
        new Uint8Array(message.data),
        3,
        'int32',
        true,
      );
      const model = await cocoSsd.load();
      const predictions = await model.detect(image as Tensor3D);
      client.send(JSON.stringify(predictions));
      tf.dispose(image);
    } catch (error: any) {
      console.error('Error processing image:', error);
      client.send(JSON.stringify({ error: error.message }));
    }
  }
}
