import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // Convert expiration_date string to proper DateTime if provided
    if (data.expiration_date && typeof data.expiration_date === 'string') {
      data.expiration_date = new Date(data.expiration_date + 'T00:00:00.000Z');
    }
    
    return this.prisma.reservation.create({ data });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        Reader: { select: { User: { select: { first_name: true, last_name: true } } } },
        BookItem: { select: { Book: { select: { title: true } } } },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        Reader: { select: { User: { select: { first_name: true, last_name: true } } } },
        BookItem: { select: { Book: { select: { title: true } } } },
      },
    });
  }

  async update(id: number, data: any) {
    // Convert expiration_date string to proper DateTime if provided
    if (data.expiration_date && typeof data.expiration_date === 'string') {
      data.expiration_date = new Date(data.expiration_date + 'T00:00:00.000Z');
    }
    
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }
} 