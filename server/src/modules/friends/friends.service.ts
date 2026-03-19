import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(userId: string, targetUsername: string) {
    // Find target user by username#discriminator or just username
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

    // Check if already friends or request exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: targetUser.id },
          { userId: targetUser.id, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('Already friends');
      }
      if (existing.status === FriendshipStatus.PENDING && existing.userId === userId) {
        throw new BadRequestException('Request already sent');
      }
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException('Cannot send request');
      }
    }

    // Create or update friendship
    if (existing && existing.status === FriendshipStatus.PENDING) {
      // Incoming request exists, accept it implicitly
      return this.acceptFriendRequest(targetUser.id, userId);
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        userId,
        friendId: targetUser.id,
        status: FriendshipStatus.PENDING,
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
        status: FriendshipStatus.PENDING,
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    await this.prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: FriendshipStatus.ACCEPTED },
    });

    // Create DM channel
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
        status: FriendshipStatus.PENDING,
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

  async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    await this.prisma.friendship.upsert({
      where: {
        userId_friendId: {
          userId,
          friendId: targetUserId,
        },
      },
      update: {
        status: FriendshipStatus.BLOCKED,
      },
      create: {
        userId,
        friendId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    return { success: true };
  }

  async unblockUser(userId: string, targetUserId: string) {
    await this.prisma.friendship.deleteMany({
      where: {
        userId,
        friendId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    return { success: true };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: FriendshipStatus.ACCEPTED },
          { friendId: userId, status: FriendshipStatus.ACCEPTED },
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
        status: FriendshipStatus.PENDING,
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
        status: FriendshipStatus.PENDING,
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

  async getOrCreateDMChannel(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot create DM with yourself');
    }

    // Check if channel exists
    let channel = await this.prisma.dmChannel.findFirst({
      where: {
        OR: [
          { userId, recipientId },
          { userId: recipientId, recipientId: userId },
        ],
      },
    });

    if (channel) {
      return channel;
    }

    // Create new channel
    channel = await this.prisma.dmChannel.create({
      data: {
        userId,
        recipientId,
      },
    });

    return channel;
  }
}
