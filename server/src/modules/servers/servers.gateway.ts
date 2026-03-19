import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/servers',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ServersGateway {
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

  @SubscribeMessage('join_server')
  async handleJoinServer(@ConnectedSocket() client: Socket, @MessageBody() data: { serverId: string }) {
    client.join(`server:${data.serverId}`);
    return { success: true };
  }

  @SubscribeMessage('leave_server')
  async handleLeaveServer(@ConnectedSocket() client: Socket, @MessageBody() data: { serverId: string }) {
    client.leave(`server:${data.serverId}`);
    return { success: true };
  }

  emitServerUpdate(serverId: string, data: any) {
    this.server.to(`server:${serverId}`).emit('server_update', data);
  }

  emitMemberJoined(serverId: string, member: any) {
    this.server.to(`server:${serverId}`).emit('member_joined', member);
  }

  emitMemberLeft(serverId: string, userId: string) {
    this.server.to(`server:${serverId}`).emit('member_left', { userId });
  }
}
