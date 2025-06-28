import { Module } from '@nestjs/common';
import { BookItemService } from './book-item.service';
import { BookItemController } from './book-item.controller';
import { PrismaModule } from '../modules/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookItemController],
  providers: [BookItemService],
})
export class BookItemModule {} 