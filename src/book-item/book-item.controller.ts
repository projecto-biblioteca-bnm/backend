import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookItemService } from './book-item.service';
import { CreateBookItemDto } from '../dto/book-item/create-book-item.dto';

@Controller('book-item')
export class BookItemController {
  constructor(private readonly bookItemService: BookItemService) {}

  @Post()
  create(@Body() createBookItemDto: CreateBookItemDto) {
    return this.bookItemService.create(createBookItemDto);
  }

  @Get()
  findAll() {
    return this.bookItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookItemService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateBookItemDto>) {
    return this.bookItemService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookItemService.remove(Number(id));
  }
} 