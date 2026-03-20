import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async create(serverId: string, userId: string, createChannelDto: CreateChannelDto) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    const member = await this.prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this server');
    }

    const maxPosition = await this.prisma.channel.aggregate({
      where: { serverId },
      _max: { position: true },
    });

    return this.prisma.channel.create({
      data: {
        ...createChannelDto,
        serverId,
        position: createChannelDto.position ?? (maxPosition._max.position ?? 0) + 1,
      },
    });
  }

  async update(channelId: string, userId: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });

    if (!channel || !channel.serverId) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.server.ownerId !== userId) {
      throw new ForbiddenException('Only the server owner can update channels');
    }

    return this.prisma.channel.update({
      where: { id: channelId },
      data: updateChannelDto,
    });
  }

  async delete(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });

    if (!channel || !channel.serverId) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.server.ownerId !== userId) {
      throw new ForbiddenException('Only the server owner can delete channels');
    }

    const channelCount = await this.prisma.channel.count({
      where: { serverId: channel.serverId },
    });

    if (channelCount <= 1) {
      throw new ForbiddenException('Cannot delete the last channel');
    }

    return this.prisma.channel.delete({
      where: { id: channelId },
    });
  }

  async getMessages(channelId: string, userId: string, limit = 50) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.serverId) {
      const member = await this.prisma.serverMember.findUnique({
        where: {
          serverId_userId: {
            serverId: channel.serverId,
            userId,
          },
        },
      });

      if (!member) {
        throw new ForbiddenException('You are not a member of this server');
      }
    }

    const messages = await this.prisma.message.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Преобразуем user в author для совместимости с фронтендом
    return messages.map(m => ({
      ...m,
      author: m.user,
    }));
  }
}
