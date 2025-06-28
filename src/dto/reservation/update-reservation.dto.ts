import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  expiration_date?: string;
} 