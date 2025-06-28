import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { BookItem_status } from '@prisma/client';

export class CreateBookItemDto {
  @IsInt()
  book_id: number;

  @IsString()
  unique_code: string;

  @IsOptional()
  @IsDateString()
  acquisition_date?: string;

  @IsOptional()
  status?: BookItem_status;

  @IsOptional()
  @IsString()
  location?: string;
} 