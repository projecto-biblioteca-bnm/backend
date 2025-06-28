import { IsOptional, IsString, IsInt, IsNumberString, IsArray } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsInt()
  page_count?: number;

  @IsOptional()
  @IsInt()
  publication_year?: number;

  @IsOptional()
  @IsInt()
  publisher_id?: number;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsArray()
  authors?: Array<{
    first_name: string;
    last_name: string;
    nationality?: string;
  }>;
} 