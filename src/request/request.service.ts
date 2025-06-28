import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from '../dto/request/create-request.dto';
import { UpdateRequestDto } from '../dto/request/update-request.dto';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRequestDto: CreateRequestDto) {
    return this.prisma.request.create({
      data: createRequestDto,
      include: {
        Reader: { 
          select: { 
            User: { 
              select: { 
                first_name: true, 
                last_name: true,
                email: true 
              } 
            } 
          } 
        },
      },
    });
  }

  async findAll() {
    return this.prisma.request.findMany({
      include: {
        Reader: { 
          select: { 
            User: { 
              select: { 
                first_name: true, 
                last_name: true,
                email: true 
              } 
            } 
          } 
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        Reader: { 
          select: { 
            User: { 
              select: { 
                first_name: true, 
                last_name: true,
                email: true 
              } 
            } 
          } 
        },
      },
    });
    
    if (!request) {
      throw new NotFoundException('Pedido não encontrado');
    }
    
    return request;
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    // Check if request exists
    await this.findOne(id);
    
    return this.prisma.request.update({
      where: { id },
      data: updateRequestDto,
      include: {
        Reader: { 
          select: { 
            User: { 
              select: { 
                first_name: true, 
                last_name: true,
                email: true 
              } 
            } 
          } 
        },
      },
    });
  }

  async remove(id: number) {
    // Check if request exists
    await this.findOne(id);
    
    return this.prisma.request.delete({
      where: { id },
    });
  }
} 