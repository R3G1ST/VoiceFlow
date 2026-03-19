import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, FriendsGateway],
  exports: [FriendsService],
})
export class FriendsModule {}
