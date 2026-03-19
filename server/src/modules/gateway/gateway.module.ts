import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { MainGateway } from './main.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ServersGateway } from '../servers/servers.gateway';

@Module({
  imports: [JwtModule],
  providers: [GatewayService, MainGateway, ServersGateway],
  exports: [GatewayService],
})
export class GatewayModule {}
