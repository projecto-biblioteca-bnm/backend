import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from './user.module';
import { PrismaModule } from './prisma.module';
import { CategoryModule } from '../category/category.module';
import { PublisherModule } from '../publisher/publisher.module';
import { BookModule } from '../book/book.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { ReservationModule } from '../reservation/reservation.module';
import { LoanModule } from '../loan/loan.module';
import { BookItemModule } from '../book-item/book-item.module';
import { RequestModule } from '../request/request.module';
import { EventModule } from '../event/event.module';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    CategoryModule,
    PublisherModule,
    BookModule,
    StatisticsModule,
    ReservationModule,
    LoanModule,
    BookItemModule,
    RequestModule,
    EventModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
