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
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private serversService: ServersService) {}

  @Post()
  create(@Request() req, @Body() createServerDto: CreateServerDto) {
    return this.serversService.create(req.user.id, createServerDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.serversService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.serversService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateServerDto: UpdateServerDto,
  ) {
    return this.serversService.update(id, req.user.id, updateServerDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.serversService.delete(id, req.user.id);
  }

  @Post(':id/invite')
  inviteUser(
    @Request() req,
    @Param('id') id: string,
    @Body('username') username: string,
  ) {
    return this.serversService.inviteUser(id, req.user.id, username);
  }

  @Post(':id/kick/:targetUserId')
  kickMember(
    @Request() req,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.serversService.kickMember(id, req.user.id, targetUserId);
  }
}
