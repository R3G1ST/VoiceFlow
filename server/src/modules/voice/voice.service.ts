import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as mediasoup from 'mediasoup';
import type {
  Worker,
  WebRtcTransport,
  Producer,
  Consumer,
  Router,
} from 'mediasoup/node/lib/types';

interface Room {
  router: Router;
  transports: Map<string, WebRtcTransport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
  participants: Map<string, RoomParticipant>;
}

interface RoomParticipant {
  userId: string;
  username: string;
  audioProducer?: string;
  videoProducer?: string;
  screenProducer?: string;
}

@Injectable()
export class VoiceService {
  private workers: Worker[] = [];
  private rooms: Map<string, Room> = new Map();
  private nextWorkerIdx = 0;
  private readonly MAX_PARTICIPANTS = 30;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // Create mediasoup workers
    const workerCount = 2;
    for (let i = 0; i < workerCount; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: 'warn',
        rtcMinPort: parseInt(this.configService.get('MEDIASOUP_MIN_PORT', '40000')),
        rtcMaxPort: parseInt(this.configService.get('MEDIASOUP_MAX_PORT', '40100')),
      });

      worker.on('died', () => {
        console.error('mediasoup worker died, exiting in 2 seconds...');
        setTimeout(() => process.exit(1), 2000);
      });

      this.workers.push(worker);
    }

    console.log(`Created ${this.workers.length} mediasoup workers`);
  }

  private getWorker(): Worker {
    const worker = this.workers[this.nextWorkerIdx];
    this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    return worker;
  }

  async getOrCreateRoom(roomId: string): Promise<Room> {
    let room = this.rooms.get(roomId);

    if (!room) {
      const worker = this.getWorker();
      const router = await worker.createRouter({
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
          },
          {
            kind: 'video',
            mimeType: 'video/VP9',
            clockRate: 90000,
          },
          {
            kind: 'video',
            mimeType: 'video/H264',
            clockRate: 90000,
          },
        ],
      });

      room = {
        router,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
        participants: new Map(),
      };

      this.rooms.set(roomId, room);
    }

    return room;
  }

  async joinVoiceChannel(
    channelId: string,
    userId: string,
    username: string,
    sessionId: string,
  ) {
    const room = await this.getOrCreateRoom(channelId);

    if (room.participants.size >= this.MAX_PARTICIPANTS) {
      throw new BadRequestException('Voice channel is full (max 30 participants)');
    }

    // Check if user is already in another channel
    for (const [roomId, r] of this.rooms.entries()) {
      if (r.participants.has(userId)) {
        await this.leaveVoiceChannel(roomId, userId);
      }
    }

    // Save voice state to database
    await this.prisma.voiceState.upsert({
      where: { sessionId },
      update: {
        channelId,
        deaf: false,
        mute: false,
        selfDeaf: false,
        selfMute: false,
        selfVideo: false,
        suppress: false,
      },
      create: {
        sessionId,
        userId,
        channelId,
        serverId: await this.getChannelServerId(channelId),
        deaf: false,
        mute: false,
        selfDeaf: false,
        selfMute: false,
        selfVideo: false,
        suppress: false,
      },
    });

    room.participants.set(userId, {
      userId,
      username,
    });

    return {
      roomId: channelId,
      participantId: userId,
    };
  }

  async leaveVoiceChannel(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove all producers and consumers for this user
    for (const [producerId, producer] of room.producers.entries()) {
      if (producer.appData.userId === userId) {
        producer.close();
        room.producers.delete(producerId);
      }
    }

    for (const [consumerId, consumer] of room.consumers.entries()) {
      if (consumer.appData.userId === userId) {
        consumer.close();
        room.consumers.delete(consumerId);
      }
    }

    // Remove transports
    for (const [transportId, transport] of room.transports.entries()) {
      if (transport.appData.userId === userId) {
        transport.close();
        room.transports.delete(transportId);
      }
    }

    room.participants.delete(userId);

    // Update database
    await this.prisma.voiceState.deleteMany({
      where: { userId },
    });

    // Remove room if empty
    if (room.participants.size === 0) {
      room.router.close();
      this.rooms.delete(roomId);
    }
  }

  async createWebRtcTransport(roomId: string, userId: string, isProducer: boolean) {
    const room = await this.getOrCreateRoom(roomId);

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: this.configService.get('MEDIASOUP_ANNOUNCED_IP'),
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      maxIncomingBitrate: 1500000,
    });

    transport.appData = { userId, isProducer };
    room.transports.set(transport.id, transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
  }

  async connectWebRtcTransport(roomId: string, transportId: string, dtlsParameters: any) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new NotFoundException('Transport not found');
    }

    await transport.connect({ dtlsParameters });
    return { success: true };
  }

  async produce(
    roomId: string,
    transportId: string,
    kind: 'audio' | 'video',
    userId: string,
  ) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new NotFoundException('Transport not found');
    }

    const producer = await transport.produce({
      kind,
      rtpParameters: {} as any,
      appData: { userId },
    });

    room.producers.set(producer.id, producer);

    // Update participant
    const participant = room.participants.get(userId);
    if (participant) {
      if (kind === 'audio') {
        participant.audioProducer = producer.id;
      } else if (kind === 'video') {
        participant.videoProducer = producer.id;
      }
    }

    // Notify other participants
    const newProducer = {
      id: producer.id,
      userId,
      kind,
      rtpParameters: producer.rtpParameters,
    };

    return newProducer;
  }

  async consume(roomId: string, transportId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const transport = room.transports.get(transportId);
    if (!transport) {
      throw new NotFoundException('Transport not found');
    }

    const consumers: any[] = [];

    // Create consumers for all producers except user's own
    for (const [producerId, producer] of room.producers.entries()) {
      if (producer.appData.userId !== userId) {
        const consumer = await transport.consume({
          producerId,
          rtpCapabilities: {} as any,
          appData: { userId },
        });

        room.consumers.set(consumer.id, consumer);

        consumers.push({
          producerId: producer.id,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          userId: producer.appData.userId,
        });
      }
    }

    return consumers;
  }

  async getRoomState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { participants: [], producers: [] };
    }

    const participants = Array.from(room.participants.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      hasAudio: !!p.audioProducer,
      hasVideo: !!p.videoProducer,
      hasScreen: !!p.screenProducer,
    }));

    const producers = Array.from(room.producers.entries()).map(([id, p]) => ({
      id,
      userId: p.appData.userId,
      kind: p.kind,
    }));

    return { participants, producers };
  }

  private async getChannelServerId(channelId: string): Promise<string | null> {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        select: { serverId: true },
      });
      return channel?.serverId || null;
    } catch {
      return null;
    }
  }
}
