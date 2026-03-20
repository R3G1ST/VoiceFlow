import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(userId: string, targetUsername: string) {
    let targetUser;
    const parts = targetUsername.split('#');

    if (parts.length === 2 && parts[1].length === 4) {
      targetUser = await this.prisma.user.findFirst({
        where: {
          username: parts[0],
          discriminator: parts[1],
        },
      });
    } else {
      targetUser = await this.prisma.user.findFirst({
        where: { username: targetUsername },
      });
    }

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === userId) {
      throw new BadRequestException('Cannot add yourself');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: targetUser.id },
          { userId: targetUser.id, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already friends');
      }
      if (existing.status === 'PENDING' && existing.userId === userId) {
        throw new BadRequestException('Request already sent');
      }
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        userId,
        friendId: targetUser.id,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
      },
    });

    return friendship;
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId: friendId,
        friendId: userId,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    await this.prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'ACCEPTED' },
    });

    await this.prisma.dmChannel.create({
      data: {
        userId,
        recipientId: friendId,
      },
    });

    return { success: true };
  }

  async declineFriendRequest(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: friendId, friendId: userId },
          { userId, friendId },
        ],
        status: 'PENDING',
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return { success: true };
  }

  async removeFriend(userId: string, friendId: string) {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return { success: true };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
            status: true,
            customStatus: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
            status: true,
            customStatus: true,
          },
        },
      },
    });

    return friendships.map((f) => ({
      id: f.user.id === userId ? f.friend.id : f.user.id,
      user: f.user.id === userId ? f.friend : f.user,
    }));
  }

  async getPendingRequests(userId: string) {
    const incoming = await this.prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
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

    const outgoing = await this.prisma.friendship.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
      },
    });

    return {
      incoming: incoming.map((f) => f.user),
      outgoing: outgoing.map((f) => f.friend),
    };
  }

  async getDMChannels(userId: string) {
    const channels = await this.prisma.dmChannel.findMany({
      where: {
        OR: [{ userId }, { recipientId: userId }],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
            status: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
            status: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return channels.map((c) => ({
      id: c.id,
      recipient: c.user.id === userId ? c.recipient : c.user,
      lastMessage: c.messages[0] || null,
    }));
  }
}
