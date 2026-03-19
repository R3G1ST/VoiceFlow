import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { VoiceService } from './voice.service';
import { ServersGateway } from '../servers/servers.gateway';

@WebSocketGateway({
  namespace: '/voice',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class VoiceGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private voiceService: VoiceService,
    private serversGateway: ServersGateway,
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
      client.data.username = payload.username || 'User';
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.roomId && client.data.userId) {
      await this.voiceService.leaveVoiceChannel(client.data.roomId, client.data.userId);
      this.serversGateway.emitMemberLeft(client.data.serverId, client.data.userId);
    }
  }

  @SubscribeMessage('join_voice')
  async handleJoinVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; serverId?: string },
  ) {
    const userId = client.data.userId;
    const username = client.data.username;
    const sessionId = client.id;

    const result = await this.voiceService.joinVoiceChannel(
      data.channelId,
      userId,
      username,
      sessionId,
    );

    client.data.roomId = data.channelId;
    client.data.serverId = data.serverId;

    // Join socket room
    client.join(`voice:${data.channelId}`);

    // Notify others
    this.server.to(`voice:${data.channelId}`).emit('user_connected', {
      userId,
      username,
    });

    return result;
  }

  @SubscribeMessage('leave_voice')
  async handleLeaveVoice(@ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const serverId = client.data.serverId;
    const userId = client.data.userId;

    if (roomId && userId) {
      await this.voiceService.leaveVoiceChannel(roomId, userId);
      client.leave(`voice:${roomId}`);

      this.server.to(`voice:${roomId}`).emit('user_disconnected', { userId });

      if (serverId) {
        this.serversGateway.emitMemberLeft(serverId, userId);
      }
    }

    delete client.data.roomId;
    delete client.data.serverId;

    return { success: true };
  }

  @SubscribeMessage('create_transport')
  async handleCreateTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { isProducer: boolean },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.userId;

    if (!roomId || !userId) {
      return { error: 'Not in a voice channel' };
    }

    const transport = await this.voiceService.createWebRtcTransport(
      roomId,
      userId,
      data.isProducer,
    );

    return transport;
  }

  @SubscribeMessage('connect_transport')
  async handleConnectTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transportId: string; dtlsParameters: any },
  ) {
    const roomId = client.data.roomId;

    if (!roomId) {
      return { error: 'Not in a voice channel' };
    }

    return this.voiceService.connectWebRtcTransport(
      roomId,
      data.transportId,
      data.dtlsParameters,
    );
  }

  @SubscribeMessage('produce')
  async handleProduce(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transportId: string; kind: 'audio' | 'video' },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.userId;

    if (!roomId || !userId) {
      return { error: 'Not in a voice channel' };
    }

    const producer = await this.voiceService.produce(
      roomId,
      data.transportId,
      data.kind,
      userId,
    );

    // Notify others about new producer
    this.server.to(`voice:${roomId}`).emit('new_producer', producer);

    return producer;
  }

  @SubscribeMessage('consume')
  async handleConsume(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transportId: string },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.userId;

    if (!roomId || !userId) {
      return { error: 'Not in a voice channel' };
    }

    return this.voiceService.consume(roomId, data.transportId, userId);
  }

  @SubscribeMessage('set_media_state')
  async handleSetMediaState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { audio: boolean; video: boolean; screen: boolean },
  ) {
    const roomId = client.data.roomId;

    if (roomId) {
      this.server.to(`voice:${roomId}`).emit('media_state_changed', {
        userId: client.data.userId,
        ...data,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('room_state')
  async handleGetRoomState(@ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;

    if (!roomId) {
      return { participants: [], producers: [] };
    }

    return this.voiceService.getRoomState(roomId);
  }
}
