import { IsString, IsNotEmpty, IsOptional, IsInt, IsISBN, IsArray } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle: string;

  @IsString()
  @IsOptional()
  synopsis: string;

  @IsString()
  @IsOptional()
  edition: string;

  @IsString()
  @IsOptional()
  language: string;

  @IsInt()
  @IsOptional()
  page_count: number;

  @IsInt()
  @IsOptional()
  publication_year: number;

  @IsInt()
  @IsNotEmpty()
  publisher_id: number;

  @IsInt()
  @IsNotEmpty()
  category_id: number;

  @IsArray()
  @IsOptional()
  authors?: Array<{
    first_name: string;
    last_name: string;
    nationality?: string;
  }>;
} 