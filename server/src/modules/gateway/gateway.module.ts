import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GatewayService } from './gateway.service';
import { MainGateway } from './main.gateway';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [
    FriendsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  providers: [GatewayService, MainGateway],
  exports: [GatewayService],
})
export class GatewayModule {}
