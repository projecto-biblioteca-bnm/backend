import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStatistics() {
    const totalBooks = await this.prisma.book.count();
    const totalReaders = await this.prisma.reader.count();
    const activeLoans = await this.prisma.loan.count({
      where: { status: 'Loaned' },
    });
    
    const booksByCategory = await this.prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { Book: true },
        },
      },
    });

    const popularGenres = booksByCategory.map(category => ({
      name: category.name,
      count: category._count.Book,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalBooks,
      totalReaders,
      activeLoans,
      popularGenres,
    };
  }
}
