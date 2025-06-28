import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublisherDto } from '../dto/publisher/create-publisher.dto';
import { UpdatePublisherDto } from '../dto/publisher/update-publisher.dto';

@Injectable()
export class PublisherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPublisherDto: CreatePublisherDto) {
    return this.prisma.publisher.create({
      data: createPublisherDto,
    });
  }

  async findAll() {
    return this.prisma.publisher.findMany();
  }

  async findOne(id: number) {
    return this.prisma.publisher.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePublisherDto: UpdatePublisherDto) {
    return this.prisma.publisher.update({
      where: { id },
      data: updatePublisherDto,
    });
  }

  async remove(id: number) {
    return this.prisma.publisher.delete({
      where: { id },
    });
  }
}
