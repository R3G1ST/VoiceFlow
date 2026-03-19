import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServersGateway } from './servers.gateway';

@Module({
  controllers: [ServersController],
  providers: [ServersService, ServersGateway],
  exports: [ServersService],
})
export class ServersModule {}
