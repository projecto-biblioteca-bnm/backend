import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled'])
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

  @IsOptional()
  @IsInt()
  created_by?: number;
} 