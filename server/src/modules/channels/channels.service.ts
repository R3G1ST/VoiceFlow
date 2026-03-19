import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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
      where: { serverId, parentId: createChannelDto.parentId },
      _max: { position: true },
    });

    return this.prisma.channel.create({
      data: {
        ...createChannelDto,
        serverId,
        position: (maxPosition._max.position || 0) + 1,
      },
    });
  }

  async update(channelId: string, userId: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (!channel.serverId) {
      throw new BadRequestException('Cannot update DM channels');
    }

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

    // Check if owner or has permission (simplified - only owner can update)
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

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (!channel.serverId) {
      throw new BadRequestException('Cannot delete DM channels');
    }

    if (channel.server.ownerId !== userId) {
      throw new ForbiddenException('Only the server owner can delete channels');
    }

    // Cannot delete the last channel
    const channelCount = await this.prisma.channel.count({
      where: { serverId: channel.serverId },
    });

    if (channelCount <= 1) {
      throw new BadRequestException('Cannot delete the last channel');
    }

    return this.prisma.channel.delete({
      where: { id: channelId },
    });
  }

  async reorder(
    serverId: string,
    userId: string,
    updates: { id: string; position: number; parentId?: string }[],
  ) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the server owner can reorder channels');
    }

    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.channel.update({
          where: { id: update.id },
          data: {
            position: update.position,
            parentId: update.parentId,
          },
        }),
      ),
    );

    return true;
  }

  async findOne(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        parent: true,
        children: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // If it's a server channel, check membership
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

    return channel;
  }

  async getMessages(channelId: string, userId: string, cursor?: string, limit = 50) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check access
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
        author: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
            status: true,
            customStatus: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                discriminator: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    return messages.reverse();
  }
}
