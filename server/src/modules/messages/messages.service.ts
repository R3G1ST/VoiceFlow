import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

      // Create message with member reference
      return this.prisma.message.create({
        data: {
          content: createMessageDto.content,
          channelId,
          authorId: userId,
          memberId: member.id,
          attachments: createMessageDto.attachments,
          embeds: createMessageDto.embeds,
          replyToId: createMessageDto.replyToId,
          mentions: createMessageDto.mentions
            ? { connect: createMessageDto.mentions.map((id) => ({ id })) }
            : undefined,
        },
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
          reactions: {
            select: {
              emoji: true,
              userId: true,
            },
          },
        },
      });
    }

    // DM channel
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        channelId,
        authorId: userId,
        attachments: createMessageDto.attachments,
        embeds: createMessageDto.embeds,
        replyToId: createMessageDto.replyToId,
        mentions: createMessageDto.mentions
          ? { connect: createMessageDto.mentions.map((id) => ({ id })) }
          : undefined,
      },
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
        reactions: {
          select: {
            emoji: true,
            userId: true,
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

    if (message.authorId !== userId) {
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

    // Check if user is the author or has permission
    let canDelete = message.authorId === userId;

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

    // Soft delete
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
        content: '[Deleted Message]',
      },
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    try {
      return await this.prisma.reaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
      });
    } catch (error) {
      // Reaction already exists
      return null;
    }
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.reaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
      },
    });
  }

  async getReactions(messageId: string, emoji?: string) {
    const reactions = await this.prisma.reaction.findMany({
      where: {
        messageId,
        ...(emoji && { emoji }),
      },
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
    });

    // Group by emoji
    const grouped: Record<string, { emoji: string; count: number; users: any[] }> = {};

    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.user);
    }

    return Object.values(grouped);
  }

  async search(channelId: string, userId: string, query: string, limit = 25) {
    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
        content: {
          contains: query,
          mode: 'insensitive',
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

    return messages.reverse();
  }

  async pin(messageId: string, userId: string) {
    // Implementation for pinned messages
    // For now, we'll use a simple approach
    return { success: true };
  }

  async unpin(messageId: string, userId: string) {
    return { success: true };
  }

  async getPinnedMessages(channelId: string, userId: string) {
    // Implementation for getting pinned messages
    return [];
  }
}
