import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(channelId: string, userId: string, createMessageDto: CreateMessageDto) {
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

      return this.prisma.message.create({
        data: {
          content: createMessageDto.content,
          channelId,
          userId,
          replyToId: createMessageDto.replyToId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              discriminator: true,
              avatar: true,
            },
          },
        },
      });
    }

    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        channelId,
        userId,
        replyToId: createMessageDto.replyToId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(messageId: string, userId: string, updateMessageDto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        editedAt: new Date(),
      },
    });
  }

  async delete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            server: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    let canDelete = message.userId === userId;

    if (!canDelete && message.channel.serverId) {
      const server = await this.prisma.server.findUnique({
        where: { id: message.channel.serverId },
      });

      if (server?.ownerId === userId) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      throw new ForbiddenException('You cannot delete this message');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
        content: '[Deleted Message]',
      },
    });
  }

  async search(channelId: string, userId: string, query: string, limit = 25) {
    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
        content: {
          contains: query,
        },
        deletedAt: null,
      },
      include: {
        author: {
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

    return messages;
  }
}
