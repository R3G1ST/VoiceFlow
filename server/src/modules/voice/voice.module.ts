import { Module } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { VoiceGateway } from './voice.gateway';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService, VoiceGateway],
  exports: [VoiceService],
})
export class VoiceModule {}
