import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { GatewayService } from './gateway.service';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsGateway } from '../friends/friends.gateway';

@WebSocketGateway({
  namespace: '/main',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private gatewayService: GatewayService,
    private prisma: PrismaService,
    private friendsGateway: FriendsGateway,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;

      // Add to online users
      this.gatewayService.addUserSocket(payload.sub, client.id);

      // Update user status to online
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { status: 'ONLINE' },
      });

      // Notify friends
      this.friendsGateway.emitUserStatus(payload.sub, 'ONLINE');

      client.join(`user:${payload.sub}`);

      console.log(`User ${payload.sub} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.gatewayService.removeUserSocket(userId, client.id);

      // Check if user has no more connections
      if (!this.gatewayService.isUserOnline(userId)) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { status: 'OFFLINE', lastSeenAt: new Date() },
        });

        this.friendsGateway.emitUserStatus(userId, 'OFFLINE');
      }

      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers() {
    return { users: this.gatewayService.getOnlineUsers() };
  }

  @SubscribeMessage('set_status')
  async handleSetStatus(@ConnectedSocket() client: Socket, @MessageBody() data: { status: string; customStatus?: string }) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: data.status,
        customStatus: data.customStatus,
      },
    });

    this.friendsGateway.emitUserStatus(userId, data.status, data.customStatus);

    return { success: true };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { pong: true, timestamp: Date.now() };
  }
}
