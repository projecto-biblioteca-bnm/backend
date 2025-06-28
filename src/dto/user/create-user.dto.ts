import { IsString, IsEmail, MinLength, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { User_user_type } from '@prisma/client';
console.log(User_user_type);

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: Date;

  @IsEnum(User_user_type)
  user_type: User_user_type;
}
