import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('add')
  sendFriendRequest(@Request() req, @Body('username') username: string) {
    return this.friendsService.sendFriendRequest(req.user.id, username);
  }

  @Post('accept/:friendId')
  acceptFriendRequest(@Request() req, @Param('friendId') friendId: string) {
    return this.friendsService.acceptFriendRequest(req.user.id, friendId);
  }

  @Post('decline/:friendId')
  declineFriendRequest(@Request() req, @Param('friendId') friendId: string) {
    return this.friendsService.declineFriendRequest(req.user.id, friendId);
  }

  @Delete('remove/:friendId')
  removeFriend(@Request() req, @Param('friendId') friendId: string) {
    return this.friendsService.removeFriend(req.user.id, friendId);
  }

  @Post('block/:targetUserId')
  blockUser(@Request() req, @Param('targetUserId') targetUserId: string) {
    return this.friendsService.blockUser(req.user.id, targetUserId);
  }

  @Post('unblock/:targetUserId')
  unblockUser(@Request() req, @Param('targetUserId') targetUserId: string) {
    return this.friendsService.unblockUser(req.user.id, targetUserId);
  }

  @Get()
  getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('requests')
  getPendingRequests(@Request() req) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Get('dm')
  getDMChannels(@Request() req) {
    return this.friendsService.getDMChannels(req.user.id);
  }

  @Post('dm/:recipientId')
  getOrCreateDMChannel(@Request() req, @Param('recipientId') recipientId: string) {
    return this.friendsService.getOrCreateDMChannel(req.user.id, recipientId);
  }
}
