import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class ServersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createServerDto: CreateServerDto) {
    const server = await this.prisma.server.create({
      data: {
        name: createServerDto.name,
        icon: createServerDto.icon,
        banner: createServerDto.banner,
        description: createServerDto.description,
        ownerId: userId,
        channels: {
          create: {
            name: 'general',
            type: 'TEXT',
            position: 0,
          },
        },
        roles: {
          create: {
            name: '@everyone',
            color: '#000000',
            position: 0,
            permissions: BigInt(0),
            hoist: false,
            mentionable: false,
          },
        },
        members: {
          create: {
            userId,
            roles: {
              connect: {
                serverId_name: {
                  serverId: createServerDto.name, // Will be updated after server creation
                  name: '@everyone',
                },
              },
            },
          },
        },
      },
      include: {
        channels: true,
        roles: true,
      },
    });

    // Fix role connection - get the actual role ID
    const everyoneRole = await this.prisma.role.findFirst({
      where: { serverId: server.id, name: '@everyone' },
    });

    await this.prisma.serverMember.update({
      where: {
        serverId_userId: {
          serverId: server.id,
          userId,
        },
      },
      data: {
        roles: {
          connect: { id: everyoneRole?.id },
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
            roles: true,
            _count: {
              select: { members: true },
            },
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            color: true,
            position: true,
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
        roles: m.roles,
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
            roles: {
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
                roles: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                    position: true,
                  },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            color: true,
            position: true,
            permissions: true,
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
        roles: member.roles,
      },
    };
  }

  async update(serverId: string, userId: string, updateServerDto: UpdateServerDto) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the server');
    }

    return this.prisma.server.update({
      where: { id: serverId },
      data: updateServerDto,
    });
  }

  async delete(serverId: string, userId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the server');
    }

    return this.prisma.server.delete({
      where: { id: serverId },
    });
  }

  async inviteUser(serverId: string, inviterId: string, targetUsername: string) {
    // Check if inviter is a member
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

    // Find target user
    const targetUser = await this.prisma.user.findFirst({
      where: {
        username: targetUsername,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const existingMember = await this.prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member');
    }

    // Add member
    const everyoneRole = await this.prisma.role.findFirst({
      where: { serverId, name: '@everyone' },
    });

    const member = await this.prisma.serverMember.create({
      data: {
        serverId,
        userId: targetUser.id,
        roles: everyoneRole ? { connect: { id: everyoneRole.id } } : undefined,
      },
    });

    return member;
  }

  async kickMember(serverId: string, kickerId: string, targetUserId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== kickerId) {
      // Check permissions (simplified)
      throw new ForbiddenException('Only the owner can kick members');
    }

    if (server.ownerId === targetUserId) {
      throw new BadRequestException('Cannot kick the owner');
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

  async banMember(serverId: string, bannerId: string, targetUserId: string, reason?: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== bannerId) {
      throw new ForbiddenException('Only the owner can ban members');
    }

    if (server.ownerId === targetUserId) {
      throw new BadRequestException('Cannot ban the owner');
    }

    return this.prisma.$transaction([
      this.prisma.ban.create({
        data: {
          serverId,
          userId: targetUserId,
          reason,
          bannerId,
        },
      }),
      this.prisma.serverMember.delete({
        where: {
          serverId_userId: {
            serverId,
            userId: targetUserId,
          },
        },
      }),
    ]);
  }

  async unbanMember(serverId: string, unbannerId: string, targetUserId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== unbannerId) {
      throw new ForbiddenException('Only the owner can unban members');
    }

    return this.prisma.ban.delete({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId,
        },
      },
    });
  }

  async createRole(serverId: string, userId: string, createRoleDto: CreateRoleDto) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can create roles');
    }

    const maxPosition = await this.prisma.role.aggregate({
      where: { serverId },
      _max: { position: true },
    });

    return this.prisma.role.create({
      data: {
        ...createRoleDto,
        serverId,
        position: (maxPosition._max.position || 0) + 1,
      },
    });
  }

  async updateRole(
    serverId: string,
    roleId: string,
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update roles');
    }

    return this.prisma.role.update({
      where: { id: roleId, serverId },
      data: updateRoleDto,
    });
  }

  async deleteRole(serverId: string, roleId: string, userId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete roles');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role?.name === '@everyone') {
      throw new BadRequestException('Cannot delete @everyone role');
    }

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async assignRole(serverId: string, userId: string, targetUserId: string, roleId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can assign roles');
    }

    return this.prisma.serverMember.update({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId,
        },
      },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });
  }

  async removeRole(serverId: string, userId: string, targetUserId: string, roleId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can remove roles');
    }

    return this.prisma.serverMember.update({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId,
        },
      },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
    });
  }

  async getBans(serverId: string, userId: string) {
    const server = await this.getServerWithOwner(serverId);

    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can view bans');
    }

    return this.prisma.ban.findMany({
      where: { serverId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true,
          },
        },
        banner: {
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

  private async getServerWithOwner(serverId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    return server;
  }
}
