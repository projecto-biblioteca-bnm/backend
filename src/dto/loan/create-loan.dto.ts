import { IsInt, IsDateString } from 'class-validator';

export class CreateLoanDto {
  @IsInt()
  reader_id: number;

  @IsInt()
  book_item_id: number;

  @IsDateString()
  due_date: string;

  @IsDateString()
  start_date: string;
} 