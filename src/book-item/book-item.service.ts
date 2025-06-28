import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookItemDto } from '../dto/book-item/create-book-item.dto';

@Injectable()
export class BookItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookItemDto: CreateBookItemDto) {
    return this.prisma.bookItem.create({ data: createBookItemDto });
  }

  async findAll() {
    return this.prisma.bookItem.findMany({ include: { Book: true } });
  }

  async findOne(id: number) {
    const item = await this.prisma.bookItem.findUnique({
      where: { id },
      include: { Book: true },
    });
    if (!item) throw new NotFoundException('BookItem not found');
    return item;
  }

  async update(id: number, data: Partial<CreateBookItemDto>) {
    return this.prisma.bookItem.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.bookItem.delete({ where: { id } });
  }
} 