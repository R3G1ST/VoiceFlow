import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private voiceService: VoiceService) {}

  @Get('room/:roomId')
  getRoomState(@Param('roomId') roomId: string) {
    return this.voiceService.getRoomState(roomId);
  }
}
