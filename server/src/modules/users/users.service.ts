import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        status: true,
        customStatus: true,
        createdAt: true,
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        discriminator: true,
        avatar: true,
        banner: true,
        bio: true,
        status: true,
        customStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, userId: string, updateUserDto: any) {
    if (id !== userId) {
      throw new NotFoundException('Cannot update another user');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        discriminator: true,
        avatar: true,
        banner: true,
        bio: true,
        status: true,
        customStatus: true,
      },
    });

    return user;
  }

  async updateStatus(userId: string, status: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        username: true,
        discriminator: true,
        avatar: true,
        status: true,
      },
    });

    return user;
  }
}
