import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  reader_id: number;

  @IsInt()
  book_item_id: number;

  @IsOptional()
  @IsDateString()
  expiration_date?: string;
} 