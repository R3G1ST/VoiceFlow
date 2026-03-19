import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        discriminator: true,
        avatar: true,
        banner: true,
        status: true,
        customStatus: true,
        createdAt: true,
      },
    });

    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        servers: {
          include: {
            server: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    if (id !== userId) {
      throw new NotFoundException('Cannot update another user');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.sanitizeUser(user);
  }

  async updateStatus(userId: string, status: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return this.sanitizeUser(user);
  }

  async updateCustomStatus(userId: string, customStatus: string | null) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { customStatus },
    });

    return this.sanitizeUser(user);
  }

  async search(query: string, limit = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        username: true,
        discriminator: true,
        avatar: true,
      },
    });

    return users.map((u) => this.sanitizeUser(u));
  }

  private sanitizeUser(user: any) {
    const { password, twoFactorSecret, email, ...sanitized } = user;
    return sanitized;
  }
}
