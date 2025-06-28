import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    // Ensure date is in proper format for Prisma DateTime
    const eventData = {
      ...createEventDto,
      date: new Date(createEventDto.date),
    };

    return this.prisma.event.create({
      data: eventData,
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findLatest() {
    return this.prisma.event.findFirst({
      where: {
        date: {
          gte: new Date(), // Find events from today onwards
        },
        status: 'Upcoming',
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    
    // Ensure date is in proper format for Prisma if it's being updated
    const eventData = {
      ...updateEventDto,
      ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
    };

    return this.prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        User: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({
      where: { id },
    });
  }
} 