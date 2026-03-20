import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

@Injectable()
export class ServersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createServerDto: CreateServerDto) {
    const server = await this.prisma.server.create({
      data: {
        name: createServerDto.name,
        icon: createServerDto.icon,
        ownerId: userId,
        channels: {
          create: {
            name: 'general',
            type: 'TEXT',
            position: 0,
          },
        },
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        channels: {
          orderBy: { position: 'asc' },
        },
        members: {
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
        },
      },
    });

    return server;
  }

  async findAll(userId: string) {
    const memberships = await this.prisma.serverMember.findMany({
      where: { userId },
      include: {
        server: {
          include: {
            channels: {
              orderBy: { position: 'asc' },
            },
            members: {
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
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      server: m.server,
      member: {
        id: m.id,
        nickname: m.nickname,
        joinedAt: m.joinedAt,
      },
    }));
  }

  async findOne(serverId: string, userId: string) {
    const member = await this.prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId,
        },
      },
      include: {
        server: {
          include: {
            channels: {
              orderBy: { position: 'asc' },
            },
            members: {
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
              },
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Server not found or you are not a member');
    }

    return {
      server: member.server,
      member: {
        id: member.id,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
      },
    };
  }

  async update(serverId: string, userId: string, updateServerDto: UpdateServerDto) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server || server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the server');
    }

    return this.prisma.server.update({
      where: { id: serverId },
      data: updateServerDto,
    });
  }

  async delete(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server || server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the server');
    }

    return this.prisma.server.delete({
      where: { id: serverId },
    });
  }

  async inviteUser(serverId: string, inviterId: string, targetUsername: string) {
    const inviterMember = await this.prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: inviterId,
        },
      },
    });

    if (!inviterMember) {
      throw new ForbiddenException('You are not a member of this server');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { username: targetUsername },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member');
    }

    const member = await this.prisma.serverMember.create({
      data: {
        serverId,
        userId: targetUser.id,
      },
    });

    return member;
  }

  async kickMember(serverId: string, kickerId: string, targetUserId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server || server.ownerId !== kickerId) {
      throw new ForbiddenException('Only the owner can kick members');
    }

    if (server.ownerId === targetUserId) {
      throw new ForbiddenException('Cannot kick the owner');
    }

    return this.prisma.serverMember.delete({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId,
        },
      },
    });
  }
}
