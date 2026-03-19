import {
  Controller,
  Post,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, req.user.id);
  }

  @Post('delete')
  async deleteFile(@Request() req, @Body('key') key: string) {
    return this.uploadService.deleteFile(key, req.user.id);
  }
}
