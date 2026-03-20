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
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('channels/:channelId')
  create(
    @Request() req,
    @Param('channelId') channelId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.create(channelId, req.user.id, createMessageDto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, req.user.id, updateMessageDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.messagesService.delete(id, req.user.id);
  }

  @Get('search/:channelId')
  search(
    @Request() req,
    @Param('channelId') channelId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.search(channelId, req.user.id, query, limit ? parseInt(limit) : 25);
  }
}
