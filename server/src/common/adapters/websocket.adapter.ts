import { WebSocketGateway as NestWebSocketGateway } from '@nestjs/websockets';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class WebSocketAdapter extends IoAdapter {
  private readonly logger = new Logger(WebSocketAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplication, private port: number) {
    super(app);
  }

  async createIOServer(port: number): Promise<any> {
    const configService = this.app.get(ConfigService);
    
    if (port === this.port) {
      const redisClient = createClient({
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
        password: configService.get('REDIS_PASSWORD'),
      });

      await redisClient.connect();
      this.adapterConstructor = createAdapter(redisClient, redisClient);
    }

    const server = super.createIOServer(port, {
      cors: {
        origin: configService.get('CORS_ORIGIN'),
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    if (port === this.port && this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log(`WebSocket server initialized on port ${port}`);
    }

    return server;
  }
}
