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
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

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
  update(@Request() req, @Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serversService.update(id, req.user.id, updateServerDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.serversService.delete(id, req.user.id);
  }

  @Post(':id/invite')
  inviteUser(@Request() req, @Param('id') id: string, @Body('username') username: string) {
    return this.serversService.inviteUser(id, req.user.id, username);
  }

  @Post(':id/kick/:targetUserId')
  kickMember(@Request() req, @Param('id') id: string, @Param('targetUserId') targetUserId: string) {
    return this.serversService.kickMember(id, req.user.id, targetUserId);
  }

  @Post(':id/ban/:targetUserId')
  banMember(
    @Request() req,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Body('reason') reason?: string,
  ) {
    return this.serversService.banMember(id, req.user.id, targetUserId, reason);
  }

  @Post(':id/unban/:targetUserId')
  unbanMember(@Request() req, @Param('id') id: string, @Param('targetUserId') targetUserId: string) {
    return this.serversService.unbanMember(id, req.user.id, targetUserId);
  }

  @Get(':id/bans')
  getBans(@Request() req, @Param('id') id: string) {
    return this.serversService.getBans(id, req.user.id);
  }

  @Post(':id/roles')
  createRole(@Request() req, @Param('id') id: string, @Body() createRoleDto: CreateRoleDto) {
    return this.serversService.createRole(id, req.user.id, createRoleDto);
  }

  @Patch(':id/roles/:roleId')
  updateRole(
    @Request() req,
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.serversService.updateRole(id, roleId, req.user.id, updateRoleDto);
  }

  @Delete(':id/roles/:roleId')
  deleteRole(@Request() req, @Param('id') id: string, @Param('roleId') roleId: string) {
    return this.serversService.deleteRole(id, roleId, req.user.id);
  }

  @Post(':id/members/:targetUserId/roles/:roleId')
  assignRole(
    @Request() req,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.serversService.assignRole(id, req.user.id, targetUserId, roleId);
  }

  @Delete(':id/members/:targetUserId/roles/:roleId')
  removeRole(
    @Request() req,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.serversService.removeRole(id, req.user.id, targetUserId, roleId);
  }
}
