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
  namespace: '/friends',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class FriendsGateway {
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
      client.join(`user:${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('friend_request')
  async handleFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string },
  ) {
    this.server.to(`user:${data.targetUserId}`).emit('friend_request_received', {
      fromUserId: client.data.userId,
    });
    return { success: true };
  }

  @SubscribeMessage('friend_accept')
  async handleFriendAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { friendId: string },
  ) {
    this.server.to(`user:${data.friendId}`).emit('friend_accepted', {
      userId: client.data.userId,
    });
    return { success: true };
  }

  emitUserStatus(userId: string, status: string, customStatus?: string) {
    this.server.to(`user:${userId}`).emit('user_status', {
      userId,
      status,
      customStatus,
    });
  }
}
