import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ChangePasswordDto } from '../dto/user/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { User, User_user_type } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // If creating a reader, we need to create both User and Reader records
    if (data.user_type === 'Reader') {
      return this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            ...data,
            password: hashedPassword,
            user_type: data.user_type as User_user_type,
          },
        });
        
        // Create corresponding Reader record
        await prisma.reader.create({
          data: {
            id: user.id,
            identification_number: `READER_${user.id}`, // Generate a unique identification number
          },
        });
        
        return user;
      });
    }
    
    // For non-reader users, just create the User record
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        user_type: data.user_type as User_user_type,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findAllReaders() {
    return this.prisma.reader.findMany({
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateUserDto) {
    if (!id || typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    
    // Remove undefined fields
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar.');
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { passwordResetToken: token },
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Senha atual incorreta');
    if (!dto.newPassword || dto.newPassword.length < 6) throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Senha alterada com sucesso!' };
  }

  // Method to fix missing Reader records for existing users
  async fixMissingReaderRecords() {
    const readerUsers = await this.prisma.user.findMany({
      where: { user_type: 'Reader' }
    });

    const results = [];
    for (const user of readerUsers) {
      const existingReader = await this.prisma.reader.findUnique({
        where: { id: user.id }
      });

      if (!existingReader) {
        const reader = await this.prisma.reader.create({
          data: {
            id: user.id,
            identification_number: `READER_${user.id}`,
          },
        });
        results.push(`Created Reader record for User ID: ${user.id}`);
      }
    }

    return results;
  }
}
