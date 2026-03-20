import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post('servers/:serverId')
  create(
    @Request() req,
    @Param('serverId') serverId: string,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.channelsService.create(serverId, req.user.id, createChannelDto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.update(id, req.user.id, updateChannelDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.channelsService.delete(id, req.user.id);
  }

  @Get(':id/messages')
  getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.channelsService.getMessages(id, req.user.id, limit ? parseInt(limit) : 50);
  }
}
