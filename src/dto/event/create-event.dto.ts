import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled'])
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

  @IsInt()
  created_by: number;
} 