import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/channels',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChannelsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('join_channel')
  async handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string }) {
    client.join(`channel:${data.channelId}`);
    return { success: true };
  }

  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string }) {
    client.leave(`channel:${data.channelId}`);
    return { success: true };
  }

  emitMessage(channelId: string, message: any) {
    this.server.to(`channel:${channelId}`).emit('message', message);
  }

  emitMessageDeleted(channelId: string, messageId: string) {
    this.server.to(`channel:${channelId}`).emit('message_deleted', { messageId });
  }

  emitMessageUpdated(channelId: string, message: any) {
    this.server.to(`channel:${channelId}`).emit('message_updated', message);
  }

  emitTyping(channelId: string, userId: string) {
    this.server.to(`channel:${channelId}`).emit('typing', { userId });
  }
}
